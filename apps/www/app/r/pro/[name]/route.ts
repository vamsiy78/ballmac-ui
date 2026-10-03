import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { proGate, proHeaders as headers } from "@/lib/pro-gate"

// The private Pro registry. Every request is checked against the licence key, so nothing here is cached publicly.
export const dynamic = "force-dynamic"

export async function GET(req: Request, { params }: RouteContext<"/r/pro/[name]">) {
  const { name } = await params
  if (!/^[a-z0-9-]+\.json$/.test(name)) return Response.json({ error: "not_found", message: "No such Pro item." }, { status: 404, headers })
  const denied = await proGate(req)
  if (denied) return denied
  try {
    const body = await readFile(join(process.cwd(), ".registry-pro", name), "utf8")
    return new Response(body, { headers: { ...headers, "content-type": "application/json; charset=utf-8" } })
  } catch {
    return Response.json({ error: "not_found", message: `No Pro item named "${name.replace(/\.json$/, "")}".` }, { status: 404, headers })
  }
}
