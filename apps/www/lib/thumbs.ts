import "server-only"

import { existsSync } from "node:fs"
import { join } from "node:path"

/**
 * The gallery thumbnail for an item, as a path without the mode or extension (`/thumbs/hero-1` means hero-1.light.webp and
 * hero-1.dark.webp), or undefined when none was captured yet. `pnpm thumbs` writes them; Pro ones are copied in at build time.
 */
export function thumbFor(name: string, tier: string) {
  const dir = tier === "pro" ? "thumbs/pro" : "thumbs"
  return existsSync(join(process.cwd(), "public", dir, `${name}.light.webp`)) && existsSync(join(process.cwd(), "public", dir, `${name}.dark.webp`)) ? `/${dir}/${name}` : undefined
}
