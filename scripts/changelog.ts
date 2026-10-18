// Writes CHANGELOG.md from apps/www/content/changelog/, so the site, the feeds and the repository never disagree.
// `pnpm changelog --check` fails when the committed file is out of date (it runs in `pnpm check`).
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { changelogMarkdown, getChangelog } from "../apps/www/lib/changelog"

const file = join(import.meta.dirname, "..", "CHANGELOG.md")
const next = changelogMarkdown()

if (process.argv.includes("--check")) {
  let current = ""
  try {
    current = readFileSync(file, "utf8")
  } catch {}
  if (current !== next) {
    console.error("CHANGELOG.md is out of date with apps/www/content/changelog/. Run `pnpm changelog` and commit it.")
    process.exit(1)
  }
  console.log(`✓ CHANGELOG.md matches ${getChangelog().length} changelog entries`)
} else {
  writeFileSync(file, next)
  console.log(`✓ CHANGELOG.md (${getChangelog().length} entries)`)
}
