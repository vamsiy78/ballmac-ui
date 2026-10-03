import "server-only"

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { proGate, proHeaders as headers } from "@/lib/pro-gate"

/** A GET handler that serves .tar.gz files from .registry-pro/<dir> to licence holders only. */
export function archiveRoute(dir: string, label: string) {
  return async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
    const { file } = await params
    if (!/^[a-z0-9]+(-[a-z0-9]+)*(-\d+\.\d+\.\d+)?\.tar\.gz$/.test(file)) {
      return Response.json({ error: "not_found", message: `No such ${label}.` }, { status: 404, headers })
    }
    const denied = await proGate(req)
    if (denied) return denied
    try {
      const body = await readFile(join(process.cwd(), ".registry-pro", dir, file))
      return new Response(new Uint8Array(body), { headers: { ...headers, "content-type": "application/gzip", "content-disposition": `attachment; filename="${file}"`, "content-length": String(body.length) } })
    } catch {
      return Response.json({ error: "not_found", message: `No ${label} named "${file.replace(/\.tar\.gz$/, "")}".` }, { status: 404, headers })
    }
  }
}
