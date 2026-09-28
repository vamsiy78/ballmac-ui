import { allItems, detail } from "@/lib/api"
import { getItem } from "@/lib/registry"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return allItems().map((i) => ({ name: `${i.name}.json` }))
}

export async function GET(_req: Request, { params }: RouteContext<"/api/v1/items/[name]">) {
  const { name } = await params
  const item = getItem(name.replace(/\.json$/, ""))
  if (!item) return Response.json({ error: "not_found", message: `No Ballmac UI item named "${name}".` }, { status: 404 })
  return Response.json(detail(item), { headers: { "Access-Control-Allow-Origin": "*" } })
}
