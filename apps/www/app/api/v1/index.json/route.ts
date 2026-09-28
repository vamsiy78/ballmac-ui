import { allItems, API_VERSION, summary } from "@/lib/api"
import { SITE_URL } from "@/lib/registry"

export const dynamic = "force-static"

export function GET() {
  return Response.json(
    {
      version: API_VERSION,
      name: "Ballmac UI",
      homepage: SITE_URL,
      registry: `${SITE_URL}/r/{name}.json`,
      namespace: "@ballmac",
      setup: "npx shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{name}.json",
      items: allItems().map(summary),
    },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  )
}
