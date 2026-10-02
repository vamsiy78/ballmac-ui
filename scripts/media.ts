/**
 * Image slots: blocks and templates render buyer images through `Media` (`@/lib/ballmac/media`), never a bare `<img>`,
 * so every picture gets a fixed aspect ratio, lazy loading, a dark-mode variant, a fallback, and a dev alt-text warning.
 *
 *   tsx scripts/media.ts          report raw <img> / next/image in blocks and templates (exit 1 if any)
 *
 * A line with `media-ignore` in a comment is skipped. Small avatars and favicons in components are out of scope.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const SCOPES = ["registry/ballmac/components/blocks", "registry/ballmac/components/templates", "registry/ballmac/app"]

function walk(dir: string): string[] {
  try {
    return readdirSync(dir).flatMap((n) => {
      const p = join(dir, n)
      return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : []
    })
  } catch {
    return []
  }
}

const bad: string[] = []
for (const scope of SCOPES)
  for (const file of walk(join(ROOT, scope))) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (line.includes("media-ignore")) return
        if (/<img[\s>]/.test(line) || /from ["']next\/image["']/.test(line)) bad.push(`${relative(ROOT, file)}:${i + 1}  ${line.trim()}`)
      })
  }

if (bad.length) {
  console.error(`✗ Media: ${bad.length} raw image(s) in blocks or templates. Use <Media> from "@/lib/ballmac/media".\n` + bad.map((b) => "  " + b).join("\n"))
  process.exit(1)
}
console.log("✓ Media: blocks and templates render images through Media")
