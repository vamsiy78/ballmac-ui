import "server-only"

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { highlight } from "@/lib/registry"

type Raw = { title?: string; description?: string; dependencies?: string[]; registryDependencies?: string[]; files?: { path: string; content?: string }[] }

export type ProSource = {
  name: string
  title?: string
  description?: string
  dependencies: string[]
  registryDependencies: string[]
  files: { path: string; code: string; html: string }[]
}

/** Where the file lands in a project: the source path with the registry folders swapped for the shadcn alias folders. */
const shownPath = (path: string) => path.replace(/^registry\/(pro\/)?ballmac\/(components|hooks|lib)\//, "$2/ballmac/")

/**
 * The source of one Pro item from the private build on disk, highlighted. Callers must have checked who is asking: this reads the code itself.
 * Returns null for a name that is not a Pro item.
 */
export async function readProItem(name: string): Promise<ProSource | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return null
  let item: Raw
  try {
    item = JSON.parse(await readFile(join(process.cwd(), ".registry-pro", `${name}.json`), "utf8")) as Raw
  } catch {
    return null
  }
  const files = await Promise.all(
    (item.files ?? []).map(async (f) => {
      const code = f.content ?? ""
      return { path: shownPath(f.path), code, html: await highlight(code, "tsx") }
    })
  )
  return { name, title: item.title, description: item.description, dependencies: item.dependencies ?? [], registryDependencies: item.registryDependencies ?? [], files }
}
