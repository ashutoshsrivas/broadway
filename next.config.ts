import type { NextConfig } from "next";

// Product imagery is served from the S3 bucket in production; the hostname has
// to be allow-listed or next/image refuses to optimise it and the tile renders
// blank. Derived from the env so a bucket rename needs no code change.
const s3Host = process.env.S3_BUCKET
  ? `${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || "ap-southeast-2"}.amazonaws.com`
  : null;

const nextConfig: NextConfig = {
  // Bundles server.js plus only the node_modules actually reached, so the
  // 908 MB instance runs the app without a full install of dev dependencies.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(s3Host ? [{ protocol: "https" as const, hostname: s3Host }] : []),
      { protocol: "https", hostname: "*.s3.ap-southeast-2.amazonaws.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
