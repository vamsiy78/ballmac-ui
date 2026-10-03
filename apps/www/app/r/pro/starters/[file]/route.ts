import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { proGate, proHeaders as headers } from "@/lib/pro-gate"

// Starter apps (for example beacon-saas.tar.gz), downloaded with the same licence key as the registry.
export const dynamic = "force-dynamic"

export async function GET(req: Request, { params }: RouteContext<"/r/pro/starters/[file]">) {
  const { file } = await params
  if (!/^[a-z0-9]+(-[a-z0-9]+)*(-\d+\.\d+\.\d+)?\.tar\.gz$/.test(file)) {
    return Response.json({ error: "not_found", message: "No such starter." }, { status: 404, headers })
  }
  const denied = await proGate(req)
  if (denied) return denied
  try {
    const body = await readFile(join(process.cwd(), ".registry-pro", "starters", file))
    return new Response(new Uint8Array(body), { headers: { ...headers, "content-type": "application/gzip", "content-disposition": `attachment; filename="${file}"`, "content-length": String(body.length) } })
  } catch {
    return Response.json({ error: "not_found", message: `No starter named "${file.replace(/\.tar\.gz$/, "")}".` }, { status: 404, headers })
  }
}
