// Fixed-window, in-memory rate limiter for the public write endpoints
// (register, contact, place-order). Per-process only — it exists to stop
// accidental hammering and casual scripting, not a distributed attacker.
// Swap for Redis if this ever runs on more than one node.

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

let cleanupTimer: NodeJS.Timeout | null = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (bucket.resetAt < now) store.delete(key);
    }
  }, 60_000);
  cleanupTimer.unref?.();
}

export function rateLimit(opts: { key: string; max: number; windowMs: number }) {
  ensureCleanup();
  const now = Date.now();
  const bucket = store.get(opts.key);

  if (!bucket || bucket.resetAt < now) {
    store.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { limited: false, resetAt: now + opts.windowMs };
  }

  bucket.count += 1;
  return { limited: bucket.count > opts.max, resetAt: bucket.resetAt };
}

/** Best-effort caller IP for a route handler. */
export function callerIp(req: { headers: Headers }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
