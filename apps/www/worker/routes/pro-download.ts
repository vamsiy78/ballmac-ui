import { proHeaders as headers } from "@/lib/pro-gate"
import { sessionGate } from "@/lib/pro-session"

import { archiveRoute } from "./pro-archives"

// Starter apps and kits as browser downloads, for licence holders who are logged in (the CLI uses /r/pro/starters and /r/pro/kits).

const dirs: Record<string, string> = { starters: "starter app", kits: "kit" }

export async function GET(req: Request, ctx: { params: Promise<{ dir: string; file: string }>; env: Env }) {
  const { dir, file } = await ctx.params
  const label = Object.hasOwn(dirs, dir) ? dirs[dir] : undefined
  if (!label) return Response.json({ error: "not_found", message: "No such download." }, { status: 404, headers })
  return archiveRoute(dir, label, sessionGate)(req, { params: Promise.resolve({ file }), env: ctx.env })
}
