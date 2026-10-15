import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit, callerIp } from "@/lib/rate-limit";
import { nextOrderNumber, priceCart, deductStock } from "@/lib/order";
import { isRazorpayConfigured, razorpay } from "@/lib/razorpay";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .max(20)
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid 10-digit phone"),
  line1: z.string().trim().min(1, "Address is required").max(300),
  line2: z.string().trim().max(300).optional(),
  city: z.string().trim().min(1, "City is required").max(120),
  state: z.string().trim().min(1, "State is required").max(120),
  pincode: z
    .string()
    .trim()
    .refine((v) => /^\d{6}$/.test(v), "Enter a valid 6-digit PIN code"),
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
  notes: z.string().trim().max(1000).optional(),
  // Only ids and quantities are accepted. Prices are always derived server-side.
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive().max(20),
      })
    )
    .min(1, "Your bag is empty"),
});

export async function POST(req: NextRequest) {
  const { limited } = rateLimit({ key: `orders:${callerIp(req)}`, max: 10, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // An online-payment request is rejected outright when no gateway is
  // configured, rather than creating an order that could never be paid.
  if (data.paymentMethod === "RAZORPAY" && !isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Online payment is unavailable right now. Please choose Cash on Delivery." },
      { status: 400 }
    );
  }

  let priced;
  try {
    priced = await priceCart(data.items);
  } catch (err) {
    // priceCart throws readable, shopper-facing messages (out of stock, etc).
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not price your bag." },
      { status: 400 }
    );
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Create the order, retrying on the (rare) orderNumber collision between two
  // simultaneous checkouts.
  let order;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      order = await db.order.create({
        data: {
          orderNumber: await nextOrderNumber(),
          userId,
          email: data.email.toLowerCase(),
          phone: data.phone,
          name: data.name,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          paymentMethod: data.paymentMethod,
          // COD is confirmed immediately; an online order stays PENDING until
          // the signature from the gateway checks out.
          status: data.paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
          paymentStatus: "PENDING",
          subtotal: priced.subtotal,
          shipping: priced.shipping,
          total: priced.total,
          notes: data.notes || null,
          items: { create: priced.lines },
        },
      });
      break;
    } catch (err) {
      const isDuplicate =
        typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
      if (!isDuplicate || attempt === 4) {
        console.error("Order create failed", err);
        return NextResponse.json({ error: "Could not place your order." }, { status: 500 });
      }
    }
  }
  if (!order) return NextResponse.json({ error: "Could not place your order." }, { status: 500 });

  if (data.paymentMethod === "COD") {
    await deductStock(order.id);
    return NextResponse.json({ orderNumber: order.orderNumber, paid: false });
  }

  // Online: hand the browser a gateway order to open Razorpay Checkout with.
  // Stock is not touched until the payment is verified.
  try {
    const gatewayOrder = await razorpay().orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: "INR",
      receipt: order.orderNumber,
    });

    await db.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: gatewayOrder.id },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      razorpayOrderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order create failed", err);
    await db.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: "FAILED" },
    });
    return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
  }
}
