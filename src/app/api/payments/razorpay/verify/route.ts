import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { deductStock } from "@/lib/order";
import { verifyPaymentSignature } from "@/lib/razorpay";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * Confirm an online payment.
 *
 * The browser reports what Razorpay handed it, but nothing here trusts that
 * report: the order is only marked paid if the HMAC signature verifies against
 * our key secret. A bad signature marks the payment FAILED and leaves stock
 * untouched.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });
  }

  const order = await db.order.findFirst({
    where: { razorpayOrderId: parsed.data.razorpay_order_id },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: parsed.data.razorpay_order_id,
    razorpayPaymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });

  if (!valid) {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED", status: "CANCELLED" },
    });
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  // Already settled by an earlier delivery of this callback — reply success
  // without re-running the side effects.
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      razorpayPaymentId: parsed.data.razorpay_payment_id,
    },
  });
  await deductStock(order.id);

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
