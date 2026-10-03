// Writes CHANGELOG.md from apps/www/lib/changelog.ts, so the site and the repository never disagree.
import { writeFileSync } from "node:fs"
import { join } from "node:path"

import { changelogMarkdown } from "../apps/www/lib/changelog"

writeFileSync(join(import.meta.dirname, "..", "CHANGELOG.md"), changelogMarkdown())
console.log("✓ CHANGELOG.md")
