import { proHeaders as headers } from "@/lib/pro-gate"
import { readProItem } from "@/lib/pro-source"
import { sessionGate } from "@/lib/pro-session"

// The source of one Pro item, highlighted, for licence holders who are logged in. Public item pages stay static and call this from the browser.
export const dynamic = "force-dynamic"

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return Response.json({ error: "not_found", message: "No such Pro item." }, { status: 404, headers })
  const denied = await sessionGate(req)
  if (denied) return denied
  const item = await readProItem(name)
  if (!item) return Response.json({ error: "not_found", message: `No Pro item named "${name}".` }, { status: 404, headers })
  return Response.json(item, { headers })
}
