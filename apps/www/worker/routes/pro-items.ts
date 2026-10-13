import { proHeaders as headers } from "@/lib/pro-gate"
import { sessionGate } from "@/lib/pro-session"

import { readProItem } from "../pro-store"

// The source of one Pro item, highlighted, for licence holders who are logged in. Public item pages stay static and call this from the browser.

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return Response.json({ error: "not_found", message: "No such Pro item." }, { status: 404, headers })
  const denied = await sessionGate(req)
  if (denied) return denied
  const item = readProItem(name)
  if (!item) return Response.json({ error: "not_found", message: `No Pro item named "${name}".` }, { status: 404, headers })
  return Response.json(item, { headers })
}
