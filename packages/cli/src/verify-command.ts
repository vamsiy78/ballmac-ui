import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

import { CliError } from "./util.js"
import { badgeSvg, formatScorecard, loadRegistry, verifyRegistry, type Scorecard } from "./verify.js"

export type VerifyCommandOptions = {
  cwd: string
  target: string | undefined
  format: "pretty" | "json"
  minScore?: number
  limit?: number
  out?: string
  badge?: string
  itemUrl?: string
  all?: boolean
  print: (line: string) => void
  tool?: string
  /** For tests. */
  fetchImpl?: typeof fetch
}

const write = (cwd: string, file: string, text: string) => {
  const path = resolve(cwd, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

export async function verifyCommand(opts: VerifyCommandOptions): Promise<{ card: Scorecard; failed: boolean }> {
  if (!opts.target) throw new CliError("Name a registry: ballmac verify https://acme.com  or  ballmac verify ./public/r/registry.json")
  const source = await loadRegistry(opts.target, { fetchImpl: opts.fetchImpl, itemUrl: opts.itemUrl })
  const card = await verifyRegistry(source, {
    cwd: opts.cwd,
    limit: opts.limit,
    all: opts.all,
    tool: opts.tool,
    progress: opts.format === "pretty" && process.stderr.isTTY ? (done, total) => process.stderr.write(`\r  reading items ${done}/${total}`) : undefined,
  })
  if (opts.format === "pretty" && process.stderr.isTTY) process.stderr.write("\r\x1b[K")
  if (opts.out) write(opts.cwd, opts.out, JSON.stringify(card, null, 2) + "\n")
  if (opts.badge) write(opts.cwd, opts.badge, badgeSvg(card))
  opts.print(opts.format === "json" ? JSON.stringify(card, null, 2) : formatScorecard(card))
  const failed = opts.minScore !== undefined && card.score < opts.minScore
  if (failed && opts.format === "pretty") opts.print(`\n✗ Score ${card.score} is below the minimum of ${opts.minScore}.`)
  return { card, failed }
}
