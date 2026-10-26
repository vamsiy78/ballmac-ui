import "server-only"

import { highlight } from "@/lib/registry"

export type RawProItem = { title?: string; description?: string; dependencies?: string[]; registryDependencies?: string[]; files?: { path: string; content?: string }[] }

export type ProSource = {
  name: string
  title?: string
  description?: string
  dependencies: string[]
  registryDependencies: string[]
  files: { path: string; code: string; html: string }[]
  /** The build prompt for this item, when it has one. */
  prompt?: string
}

/** Where the file lands in a project: the source path with the registry folders swapped for the shadcn alias folders. */
const shownPath = (path: string) => path.replace(/^registry\/(pro\/)?ballmac\/(components|hooks|lib)\//, "$2/ballmac/")

/**
 * The source of one Pro item, highlighted, from its registry JSON. Runs when the Worker is built (worker/build-data.mts), so the Worker serves it without
 * highlighting anything per request. Returns null for a name that is not a Pro item name.
 */
export async function proSourceFrom(name: string, item: RawProItem, prompt?: string): Promise<ProSource | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return null
  const files = await Promise.all(
    (item.files ?? []).map(async (f) => {
      const code = f.content ?? ""
      return { path: shownPath(f.path), code, html: await highlight(code, "tsx") }
    })
  )
  return { name, title: item.title, description: item.description, dependencies: item.dependencies ?? [], registryDependencies: item.registryDependencies ?? [], files, ...(prompt ? { prompt } : {}) }
}
