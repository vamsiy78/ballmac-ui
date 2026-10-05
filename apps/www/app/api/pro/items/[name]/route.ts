import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { proHeaders as headers } from "@/lib/pro-gate"
import { sessionGate } from "@/lib/pro-session"
import { highlight } from "@/lib/registry"

// The source of one Pro item, highlighted, for licence holders who are logged in. Public item pages stay static and call this from the browser.
export const dynamic = "force-dynamic"

type Item = { title?: string; description?: string; dependencies?: string[]; registryDependencies?: string[]; files?: { path: string; content?: string }[] }

/** Where the file lands in a project: the source path with the registry folders swapped for the shadcn alias folders. */
const shownPath = (path: string) => path.replace(/^registry\/(pro\/)?ballmac\/(components|hooks|lib)\//, "$2/ballmac/")

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return Response.json({ error: "not_found", message: "No such Pro item." }, { status: 404, headers })
  const denied = await sessionGate(req)
  if (denied) return denied
  let item: Item
  try {
    item = JSON.parse(await readFile(join(process.cwd(), ".registry-pro", `${name}.json`), "utf8")) as Item
  } catch {
    return Response.json({ error: "not_found", message: `No Pro item named "${name}".` }, { status: 404, headers })
  }
  const files = await Promise.all(
    (item.files ?? []).map(async (f) => {
      const code = f.content ?? ""
      return { path: shownPath(f.path), code, html: await highlight(code, "tsx") }
    })
  )
  return Response.json({ name, title: item.title, description: item.description, dependencies: item.dependencies ?? [], registryDependencies: item.registryDependencies ?? [], files }, { headers })
}
