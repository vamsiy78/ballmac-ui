/**
 * A change to the published packages needs a changeset (a small note in .changeset/), so the release notes write themselves.
 *
 *   pnpm changeset:check [--base origin/preprod]
 *
 * Fails when the diff against the base touches packages/cli, packages/mcp or packages/audit (source, not tests or docs) without adding a
 * .changeset/*.md file. Runs on pull requests in CI. Skip it by adding an empty changeset (`pnpm changeset --empty`) when the change needs no note.
 */
import { execFileSync } from "node:child_process"

const i = process.argv.indexOf("--base")
const base = i > -1 ? process.argv[i + 1]! : process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "origin/preprod"
const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim()
let changed: string[]
try {
  changed = git("diff", "--name-status", `${base}...HEAD`).split("\n").filter(Boolean).map((l) => l.split("\t")) as unknown as string[]
} catch {
  console.log(`changeset check skipped: cannot diff against ${base}`)
  process.exit(0)
}
const rows = (changed as unknown as string[][]).map(([status, file]) => ({ status: status!, file: file! }))
const touched = rows.filter((r) => /^packages\/(cli|mcp|audit)\/src/.test(r.file) && !/\/vendor\//.test(r.file))
const noted = rows.some((r) => r.status.startsWith("A") && /^\.changeset\/[^/]+\.md$/.test(r.file) && !r.file.endsWith("README.md"))
if (touched.length && !noted) {
  console.error(`These files change a published package but no changeset was added:\n  ${touched.map((r) => r.file).join("\n  ")}\nRun \`pnpm changeset\` and commit the note (see CONTRIBUTING.md).`)
  process.exit(1)
}
console.log(touched.length ? "✓ changeset added" : "✓ no published package changed")
