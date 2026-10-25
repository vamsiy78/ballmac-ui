import { proGate, proHeaders as headers } from "@/lib/pro-gate"

import { readProRegistry } from "../pro-store"

// The private Pro registry. Every request is checked against the licence key, so nothing here is cached publicly.
export async function GET(req: Request, { params, env }: { params: Promise<{ name: string }>; env: Env }) {
  const { name } = await params
  if (!/^[a-z0-9-]+\.json$/.test(name)) return Response.json({ error: "not_found", message: "No such Pro item." }, { status: 404, headers })
  const denied = await proGate(req)
  if (denied) return denied
  const body = await readProRegistry(env, name)
  if (body === null) return Response.json({ error: "not_found", message: `No Pro item named "${name.replace(/\.json$/, "")}".` }, { status: 404, headers })
  return new Response(body, { headers: { ...headers, "content-type": "application/json; charset=utf-8" } })
}
