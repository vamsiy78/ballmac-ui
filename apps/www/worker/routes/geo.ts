/**
 * `GET /api/geo`: the visitor's country as Cloudflare sees it, for the pages that show a country price. Two capital letters, or null. Nothing is stored and
 * the answer is never cached, since it differs from visitor to visitor.
 */
export function GET(request: Request) {
  const raw = request.headers.get("cf-ipcountry")
  const country = raw && /^[A-Z]{2}$/.test(raw) && raw !== "XX" && raw !== "T1" ? raw : null
  return Response.json({ country }, { headers: { "cache-control": "no-store" } })
}
