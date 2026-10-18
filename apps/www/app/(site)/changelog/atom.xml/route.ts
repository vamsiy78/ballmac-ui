import { atomXml } from "@/lib/changelog-feed"

export const dynamic = "force-static"

export function GET() {
  return new Response(atomXml(), { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } })
}
