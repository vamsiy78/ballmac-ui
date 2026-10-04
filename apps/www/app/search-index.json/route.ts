import { searchEntries } from "@/lib/search-index"

// Built once and served as a static file. The search box fetches it the first time it opens.
export const dynamic = "force-static"

export function GET() {
  return Response.json(searchEntries(), { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } })
}
