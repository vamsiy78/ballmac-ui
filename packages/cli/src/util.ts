import { spawn, spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

export const sha256 = (text: string) => createHash("sha256").update(text).digest("hex")

export class CliError extends Error {}

/** package.json, tsconfig.json and components.json may have comments and trailing commas. */
export function parseJsonc<T = unknown>(text: string): T {
  let out = ""
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (inString) {
      out += c
      if (c === "\\") out += text[++i] ?? ""
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') {
      inString = true
      out += c
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++
      out += "\n"
    } else if (c === "/" && text[i + 1] === "*") {
      i += 2
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++
      i++
    } else out += c
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1")) as T
}

export function readJson<T = unknown>(path: string): T {
  return parseJsonc<T>(readFileSync(path, "utf8"))
}

export function writeFile(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

export const exists = (path: string) => existsSync(path)

/** Runs a command with the terminal attached. Resolves with the exit code. */
export function run(cmd: string, args: string[], opts: { cwd: string; env?: NodeJS.ProcessEnv }): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: "inherit", env: { ...process.env, ...opts.env } })
    child.on("error", reject)
    child.on("close", (code) => resolve(code ?? 1))
  })
}

/** Runs a command and captures its output. */
export function capture(cmd: string, args: string[], opts: { cwd: string; env?: NodeJS.ProcessEnv; input?: string }) {
  const r = spawnSync(cmd, args, { cwd: opts.cwd, encoding: "utf8", env: { ...process.env, ...opts.env }, input: opts.input, maxBuffer: 64 * 1024 * 1024 })
  return { code: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "", error: r.error }
}

const useColor = !process.env.NO_COLOR && process.stdout.isTTY
const paint = (code: number) => (s: string) => (useColor ? `\u001b[${code}m${s}\u001b[0m` : s)
export const c = { bold: paint(1), dim: paint(2), red: paint(31), green: paint(32), yellow: paint(33), cyan: paint(36) }

/** Aligned plain-text table. */
export function table(rows: string[][]) {
  const widths = rows[0]!.map((_, i) => Math.max(...rows.map((r) => stripAnsi(r[i] ?? "").length)))
  return rows.map((r) => r.map((cell, i) => cell + " ".repeat(widths[i]! - stripAnsi(cell).length)).join("  ").trimEnd()).join("\n")
}
const stripAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "")

export function compareVersions(a: string, b: string) {
  const x = a.split(".").map(Number)
  const y = b.split(".").map(Number)
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0)
  return 0
}

/** Closest names for "did you mean". */
export function suggest(name: string, all: string[], limit = 3) {
  const distance = (a: string, b: string) => {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[])
    for (let j = 1; j <= b.length; j++) dp[0]![j] = j
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++) dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
    return dp[a.length]![b.length]!
  }
  return all
    .map((n) => ({ n, d: n.includes(name) || name.includes(n) ? 0 : distance(n, name) }))
    .filter((x) => x.d <= Math.max(2, Math.floor(name.length / 3)))
    .sort((p, q) => p.d - q.d)
    .slice(0, limit)
    .map((x) => x.n)
}
