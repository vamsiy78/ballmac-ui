/**
 * Client boundary: a file without "use client" runs on the server when a page uses it. If it calls a plain function or reads a constant
 * exported from a "use client" file, Next.js fails at render time ("Attempted to call isMediaImage() from the server but isMediaImage is on the
 * client"). Components are fine, they are passed through as client references, and so are types.
 *
 * So: a file without "use client" may only import capitalised names (components) and types from a file that has it. Put shared helpers
 * in their own module (see lib/media-image.ts).
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { importPathFor, loadItems, type LoadedItem } from "./lib"

const isClient = (code: string) => /^(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/)*\s*["']use client["']/.test(code)

export function boundaryProblems(items: LoadedItem[]) {
  const fileOf = new Map<string, string>()
  for (const item of items) for (const f of item.files) {
    const spec = importPathFor(f.path)
    if (spec) fileOf.set(spec, join(item.baseDir, f.path))
  }
  const problems: string[] = []
  for (const item of items) {
    for (const f of item.files.filter((f) => /\.tsx?$/.test(f.path))) {
      const code = readFileSync(join(item.baseDir, f.path), "utf8")
      if (isClient(code)) continue
      for (const m of code.matchAll(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+"(@\/(?:components|lib|hooks)\/ballmac\/[^"]+)"/g)) {
        if (/^import\s+type\b/.test(m[0])) continue
        const target = fileOf.get(m[2]!) ?? fileOf.get(`${m[2]}/index`)
        if (!target || !isClient(readFileSync(target, "utf8"))) continue
        const values = m[1]!
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x && !x.startsWith("type "))
          .map((x) => x.split(/\s+as\s+/).pop()!.trim())
          .filter((name) => /^[a-z_$]/.test(name))
        if (values.length) problems.push(`${item.name}: ${f.path} is a server file but imports ${values.join(", ")} from the client file ${m[2]}. Move the helper into its own module.`)
      }
    }
  }
  return problems
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const items = await loadItems()
  const problems = boundaryProblems(items)
  if (problems.length) {
    console.error(`✗ Client boundary:\n  - ${problems.join("\n  - ")}`)
    process.exit(1)
  }
  console.log(`✓ Client boundary: no server file calls a function from a "use client" file (${items.length} item(s))`)
}
