import "server-only"

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { archivePattern } from "@/lib/pro-archive-core"
import { proGate, proHeaders as headers } from "@/lib/pro-gate"


/** A GET handler that serves .tar.gz and .zip files from .registry-pro/<dir> to licence holders only. */
export function archiveRoute(dir: string, label: string, gate: (req: Request) => Promise<Response | null> = proGate) {
  return async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
    const { file } = await params
    if (!archivePattern.test(file)) {
      return Response.json({ error: "not_found", message: `No such ${label}.` }, { status: 404, headers })
    }
    const denied = await gate(req)
    if (denied) return denied
    try {
      const body = await readFile(join(process.cwd(), ".registry-pro", dir, file))
      return new Response(new Uint8Array(body), { headers: { ...headers, "content-type": file.endsWith(".zip") ? "application/zip" : "application/gzip", "content-disposition": `attachment; filename="${file}"`, "content-length": String(body.length) } })
    } catch {
      return Response.json({ error: "not_found", message: `No ${label} named "${file.replace(/\.(tar\.gz|zip)$/, "")}".` }, { status: 404, headers })
    }
  }
}
