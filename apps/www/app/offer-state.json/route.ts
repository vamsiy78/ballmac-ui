import { getOffer } from "@/lib/offer"

// The Pro offer these pages were built with. The Worker's scheduled check (worker/offer-watch.ts) compares it with the offer now and starts a rebuild
// when they differ, so prices switch soon after the founding deadline or once the founding licences run out.
export const dynamic = "force-static"

export async function GET() {
  return Response.json(await getOffer(), { headers: { "cache-control": "no-store" } })
}
