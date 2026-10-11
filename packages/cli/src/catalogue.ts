import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import type { Catalogue, Ctx } from "./ctx.js"
import { CliError, c, suggest } from "./util.js"

/** Pro items install through the @ballmac-pro namespace, which sends the licence key. Adds it to components.json once. */
export function ensureProRegistry(ctx: Ctx) {
  const path = join(ctx.project.root, "components.json")
  const json = JSON.parse(readFileSync(path, "utf8")) as { registries?: Record<string, unknown> }
  if (json.registries?.["@ballmac-pro"]) return
  json.registries = {
    ...json.registries,
    "@ballmac-pro": { url: `${ctx.registry.base}/r/pro/{name}.json`, headers: { Authorization: "Bearer ${BALLMAC_LICENSE_KEY}" } },
  }
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n")
  ctx.out(c.dim('Added the "@ballmac-pro" registry to components.json (it reads BALLMAC_LICENSE_KEY from your environment or .env.local).'))
}

export function unknownNames(catalogue: Catalogue, names: string[]) {
  return names.filter((n) => !catalogue[n])
}

export function assertKnown(catalogue: Catalogue, names: string[], licensed: boolean) {
  const unknown = unknownNames(catalogue, names)
  if (!unknown.length) return
  const lines = unknown.map((n) => {
    const close = suggest(n, Object.keys(catalogue))
    return `  ${n}${close.length ? `  (did you mean ${close.join(", ")}?)` : ""}`
  })
  throw new CliError(`Not in the Ballmac UI catalogue:\n${lines.join("\n")}${licensed ? "" : "\nPro items are only listed when BALLMAC_LICENSE_KEY is set."}`)
}

