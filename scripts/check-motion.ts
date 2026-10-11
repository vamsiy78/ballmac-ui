/**
 * Motion discipline: the theme can turn decorative loops off, so every endless loop in a free item has to listen.
 *
 * A file with an endless loop (`repeat: Infinity`, or a CSS animation that is `infinite`) must either
 *   - hold still through `useLoopsPaused()` (Motion), or `animation-play-state: var(--bm-ambient-state, running)` (CSS), or
 *   - be listed in scripts/motion-functional.json with the reason it must keep moving (status indicators, carets, content).
 * The list is kept honest the other way too: an entry whose file no longer has a loop, or now listens, is an error.
 */
import { readFileSync } from "node:fs"
import { join, relative } from "node:path"

import { ROOT } from "./lib"
import { readdirSync, statSync } from "node:fs"

const LOOP = /repeat:\s*Infinity|\binfinite\b/
const LISTENS = /useLoopsPaused|--bm-ambient-state/

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : []
  })
}

export function motionProblems(files: Record<string, string>, functional: Record<string, string>) {
  const problems: string[] = []
  for (const [file, source] of Object.entries(files)) {
    const loops = LOOP.test(source)
    const listens = LISTENS.test(source)
    const listed = file in functional
    if (loops && !listens && !listed) problems.push(`${file}: has an endless loop that ignores the theme. Use useLoopsPaused() (Motion) or animation-play-state: var(--bm-ambient-state, running) (CSS), or list it in scripts/motion-functional.json with the reason it must keep moving.`)
    if (listed && (!loops || listens)) problems.push(`${file}: is listed in scripts/motion-functional.json but ${loops ? "now listens to the theme" : "has no endless loop"}. Remove the entry.`)
  }
  for (const file of Object.keys(functional)) if (!(file in files)) problems.push(`${file}: is listed in scripts/motion-functional.json but does not exist. Remove the entry.`)
  return problems
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = Object.fromEntries(walk(join(ROOT, "registry/ballmac")).map((f) => [relative(ROOT, f), readFileSync(f, "utf8")]))
  const functional = JSON.parse(readFileSync(join(ROOT, "scripts/motion-functional.json"), "utf8")) as Record<string, string>
  const problems = motionProblems(files, functional)
  if (problems.length) {
    console.error(`✗ Motion check failed:\n  - ${problems.join("\n  - ")}`)
    process.exit(1)
  }
  const loops = Object.values(files).filter((s) => LOOP.test(s)).length
  console.log(`✓ Motion: ${loops} file(s) with endless loops, ${loops - Object.keys(functional).length} follow the theme, ${Object.keys(functional).length} are functional`)
}
