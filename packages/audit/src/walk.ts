import { readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ALWAYS_SKIP = new Set(["node_modules", ".git", ".next", ".turbo", ".vercel", ".svelte-kit", "dist", "build", "out", "coverage", ".cache", ".ballmac", ".pnpm-store", "storybook-static", ".expo", "ios", "android", "target"])
/** Library code the user installed: it is tested upstream, so it is not audited unless asked. */
const LIBRARY = [/(^|\/)components\/ui(\/|$)/, /(^|\/)components\/ballmac(\/|$)/, /(^|\/)lib\/ballmac(\/|$)/, /(^|\/)hooks\/ballmac(\/|$)/]
const SOURCE = /\.(?:tsx|jsx|ts|js|mjs|cjs|css)$/
const TEST = /(?:\.test|\.spec|\.stories|\.d)\.(?:tsx|jsx|ts|js)$|(^|\/)(?:__tests__|__mocks__|e2e|tests?)\//

const toRegExp = (pattern: string) =>
  new RegExp("(^|/)" + pattern.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "").replace(/[.+^${}()|[\]]/g, "\\$&").replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*") + "(/|$)")

export type Walked = { files: string[]; skipped: string[] }

/** Source files under `root` (or the given paths), without dependencies, build output, tests or installed library code. */
export function walk(root: string, opts: { paths?: string[]; ignore?: string[]; includeLibrary?: boolean; maxFiles: number }): Walked {
  const ignore = (opts.ignore ?? []).map(toRegExp)
  const files: string[] = []
  const skipped: string[] = []
  const visit = (abs: string) => {
    if (files.length >= opts.maxFiles) return
    let st
    try {
      st = statSync(abs)
    } catch {
      return
    }
    const rel = relative(root, abs).split(sep).join("/")
    if (rel && ignore.some((r) => r.test(rel))) return
    if (st.isDirectory()) {
      const name = abs.split(sep).pop()!
      // The folder being audited is never skipped, whatever it is called.
      if (rel && (ALWAYS_SKIP.has(name) || name.startsWith("."))) return
      if (!opts.includeLibrary && LIBRARY.some((r) => r.test(rel + "/"))) return
      for (const n of readdirSync(abs).sort()) visit(join(abs, n))
      return
    }
    if (!SOURCE.test(abs) || TEST.test(rel)) return
    if (!opts.includeLibrary && LIBRARY.some((r) => r.test(rel))) return
    files.push(abs)
  }
  if (opts.paths?.length) for (const p of opts.paths) visit(join(root, p))
  else visit(root)
  if (files.length >= opts.maxFiles) skipped.push(`Stopped after ${opts.maxFiles} files. Narrow the audit with a path.`)
  return { files, skipped }
}
