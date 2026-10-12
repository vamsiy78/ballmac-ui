import { licenceText, PRO_LICENCE_EFFECTIVE, PRO_LICENCE_EMAIL, PRO_LICENCE_VERSION } from "@/lib/pro-licence"

// A plain-text copy of the Pro licence for buyers' records, and for shipping inside the starter archives.
export const dynamic = "force-static"

export function GET() {
  const body = `Ballmac UI Pro Licence Agreement\nVersion ${PRO_LICENCE_VERSION}, effective ${PRO_LICENCE_EFFECTIVE}\nContact: ${PRO_LICENCE_EMAIL}\n\n${licenceText()}\n`
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } })
}
