import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { capture } from "./util.js"

export type MergeResult = { merged: string; conflicts: number }

/** Is git on PATH? Merging and diffing use `git merge-file` and `git diff --no-index`, which need no repository. */
export function hasGit() {
  return capture("git", ["--version"], { cwd: tmpdir() }).code === 0
}

function withFiles<T>(files: Record<string, string>, fn: (paths: Record<string, string>) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "ballmac-"))
  try {
    const paths: Record<string, string> = {}
    for (const [name, content] of Object.entries(files)) {
      paths[name] = join(dir, name)
      writeFileSync(paths[name]!, content)
    }
    return fn(paths)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * Three-way merge: keeps your changes and applies Ballmac's. `base` is the upstream file you installed, `theirs` the new upstream file.
 * Where both changed the same lines the result has git-style conflict markers and `conflicts` counts them.
 */
export function merge3(ours: string, base: string, theirs: string, labels: { ours: string; base: string; theirs: string }): MergeResult {
  return withFiles({ ours, base, theirs }, (p) => {
    const r = capture("git", ["merge-file", "-p", "-L", labels.ours, "-L", labels.base, "-L", labels.theirs, p.ours!, p.base!, p.theirs!], { cwd: tmpdir() })
    // 0 = clean, 1..127 = number of conflicts, anything else = git failed.
    if (r.error || r.code < 0 || r.code > 127) throw new Error(`git merge-file failed: ${r.stderr.trim() || r.error?.message || r.code}`)
    return { merged: r.stdout, conflicts: r.code }
  })
}

/** Unified diff of two texts with labelled headers, or "" when they are equal. */
export function unifiedDiff(a: string, b: string, labelA: string, labelB: string, context = 3) {
  return withFiles({ a, b }, (p) => {
    const r = capture("git", ["diff", "--no-index", "--no-color", `-U${context}`, "--", p.a!, p.b!], { cwd: tmpdir() })
    if (r.code === 0) return ""
    if (r.code !== 1) throw new Error(`git diff failed: ${r.stderr.trim()}`)
    const body = r.stdout.split("\n").filter((l) => !/^(diff --git|index |--- |\+\+\+ |new file|deleted file)/.test(l))
    return [`--- ${labelA}`, `+++ ${labelB}`, ...body].join("\n").trimEnd() + "\n"
  })
}
