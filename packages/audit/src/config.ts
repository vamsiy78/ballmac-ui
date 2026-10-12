import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { RULES } from "./rules/meta.js"
import type { Config, RuleLevel } from "./types.js"

const LEVELS: RuleLevel[] = ["off", "info", "warn", "error"]

/**
 * Settings come from `.ballmacrc.json` in the project folder, or a `ballmac` key in package.json:
 *   { "rules": { "tokens/hardcoded-color": "off" }, "ignore": ["src/legacy"], "rtl": true }
 * Unknown rule names and levels are reported back so a typo does not silently switch nothing off.
 */
export function loadConfig(root: string, override: Partial<Config> = {}): { config: Config; problems: string[] } {
  const problems: string[] = []
  let raw: Partial<Config> = {}
  const rc = join(root, ".ballmacrc.json")
  const pkg = join(root, "package.json")
  try {
    if (existsSync(rc)) raw = JSON.parse(readFileSync(rc, "utf8"))
    else if (existsSync(pkg)) raw = (JSON.parse(readFileSync(pkg, "utf8")) as { ballmac?: Partial<Config> }).ballmac ?? {}
  } catch (e) {
    problems.push(`Could not read the Ballmac settings: ${(e as Error).message}`)
  }
  const merged: Partial<Config> = { ...raw, ...override, rules: { ...(raw.rules ?? {}), ...(override.rules ?? {}) } }
  const known = new Set(RULES.map((r) => r.id))
  const rules: Record<string, RuleLevel> = {}
  for (const [id, level] of Object.entries(merged.rules ?? {})) {
    if (!known.has(id)) problems.push(`Unknown rule "${id}" in the settings. Run ballmac check --rules to see the names.`)
    else if (!LEVELS.includes(level as RuleLevel)) problems.push(`Rule "${id}" has level "${String(level)}". Use off, info, warn or error.`)
    else rules[id] = level as RuleLevel
  }
  const ignore = Array.isArray(merged.ignore) ? merged.ignore.filter((x): x is string => typeof x === "string") : []
  return { config: { rules, ignore, rtl: Boolean(merged.rtl) }, problems }
}

/** The level a rule runs at: the setting, else the default (the right-to-left rule switches on with `rtl`). */
export function levelOf(config: Config, id: string): RuleLevel {
  if (config.rules[id]) return config.rules[id]!
  if (id === "rtl/physical-direction") return config.rtl ? "info" : "off"
  return RULES.find((r) => r.id === id)?.defaultLevel ?? "off"
}
