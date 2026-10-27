import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin-guard";
import { isS3Configured, uploadToS3 } from "@/lib/s3";

// Hero banners carry video, which is an order of magnitude bigger than a
// product photo — so the ceiling depends on what was actually uploaded rather
// than being one number for everything.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

// The extension is taken from this map, keyed on the sniffed MIME type, never
// from the uploaded filename — so an upload named "x.php" cannot keep an
// executable extension, and one named "../../etc/passwd" cannot traverse.
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
]);

/**
 * Admin-only image upload.
 *
 * Goes to S3 when a bucket is configured (production) and to public/uploads
 * otherwise (local development), so neither environment needs the other's
 * setup to work.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Allowed: JPG, PNG, WebP, AVIF images, or MP4, WebM, MOV video." },
      { status: 400 }
    );
  }

  const isVideo = file.type.startsWith("video/");
  const ceiling = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > ceiling) {
    return NextResponse.json(
      { error: `${isVideo ? "Videos" : "Images"} must be ${ceiling / 1024 / 1024} MB or smaller.` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isS3Configured()) {
    try {
      const url = await uploadToS3(buffer, file.type, ext);
      return NextResponse.json({ url }, { status: 201 });
    } catch (err) {
      // A credentials or bucket-policy problem is the operator's to fix, and
      // silently falling back to local disk would hide it until the instance
      // was replaced and the images vanished.
      console.error("S3 upload failed", err);
      return NextResponse.json(
        { error: "Could not store the image. Check the server's S3 configuration." },
        { status: 502 }
      );
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
