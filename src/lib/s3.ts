import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Product imagery lives in S3 in production and on local disk in development.
 *
 * S3 is optional: with no bucket configured the upload route writes to
 * public/uploads instead, so `npm run dev` needs no AWS account at all. That
 * also means a misconfigured deploy degrades to "images land on the instance"
 * rather than "the admin cannot save a product".
 */
export function isS3Configured(): boolean {
  return Boolean(process.env.S3_BUCKET);
}

const REGION = process.env.AWS_REGION || "ap-southeast-2";

let client: S3Client | null = null;

function s3(): S3Client {
  // Credentials are resolved by the SDK's default chain — the EC2 instance
  // role in production, or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from the
  // environment. Nothing in this repo ever holds a key.
  client ??= new S3Client({ region: REGION });
  return client;
}

/** Public URL for a stored object. Honours a CDN origin when one is set. */
export function publicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  return `https://${process.env.S3_BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Store an image and return its public URL.
 *
 * The key is a fresh UUID plus an extension derived from the sniffed MIME
 * type — never from the uploaded filename — so a file called "x.php" or
 * "../../etc/passwd" can neither escape the prefix nor keep an executable
 * extension. `ContentType` is set explicitly so the browser renders the object
 * instead of downloading it.
 */
export async function uploadToS3(
  body: Buffer,
  contentType: string,
  extension: string
): Promise<string> {
  const key = `products/${randomUUID()}.${extension}`;

  await s3().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return publicUrl(key);
}

/** Remove an object previously stored by `uploadToS3`. Best effort. */
export async function deleteFromS3(key: string): Promise<void> {
  await s3().send(
    new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key })
  );
}
