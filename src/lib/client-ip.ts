/**
 * Extract the real client IP from a Next.js request.
 *
 * On Vercel:
 *   - `x-real-ip` is always set by the edge to the actual client IP
 *     and is NOT readable from the original request → cannot be spoofed.
 *   - `x-forwarded-for` may contain a chain like "attacker-spoofed, real-client-ip"
 *     because Vercel APPENDS the real IP to whatever the client sent. The LAST entry
 *     is the trustworthy one (added by the immediate upstream proxy).
 *
 * Off-Vercel (local dev, custom proxies):
 *   - Both headers may or may not be set; behavior degrades to "unknown" gracefully.
 *
 * NEVER take the first entry of x-forwarded-for — that is the original request value
 * and can be set to anything by a hostile client.
 */
export function clientIp(req: { headers: Headers }): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim() !== "") return realIp.trim();

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const entries = xff.split(",").map(s => s.trim()).filter(s => s !== "");
    if (entries.length > 0) return entries[entries.length - 1];
  }

  return "unknown";
}
