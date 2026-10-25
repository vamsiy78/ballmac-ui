import { archivePattern } from "@/lib/pro-archive-core"
import { proGate, proHeaders as headers } from "@/lib/pro-gate"

import { readProArchive } from "../pro-store"

/** A GET handler that serves the .tar.gz and .zip files of one Pro folder (starters, kits) to licence holders only. */
export function archiveRoute(dir: string, label: string, gate: (req: Request) => Promise<Response | null> = proGate) {
  return async function GET(req: Request, { params, env }: { params: Promise<{ file: string }>; env: Env }) {
    const { file } = await params
    if (!archivePattern.test(file)) {
      return Response.json({ error: "not_found", message: `No such ${label}.` }, { status: 404, headers })
    }
    const denied = await gate(req)
    if (denied) return denied
    const archive = await readProArchive(env, dir, file)
    if (!archive) return Response.json({ error: "not_found", message: `No ${label} named "${file.replace(/\.(tar\.gz|zip)$/, "")}".` }, { status: 404, headers })
    return new Response(archive.body, { headers: { ...headers, "content-type": file.endsWith(".zip") ? "application/zip" : "application/gzip", "content-disposition": `attachment; filename="${file}"`, "content-length": String(archive.size) } })
  }
}

// The CLI's routes: /r/pro/starters/<file> and /r/pro/kits/<file>, checked against the licence key in the request.
export const starters = archiveRoute("starters", "starter")
export const kits = archiveRoute("kits", "kit")
