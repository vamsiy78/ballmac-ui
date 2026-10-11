import { existsSync } from "node:fs"
import { join } from "node:path"

import type { Project } from "./project.js"
import { CliError, capture, run } from "./util.js"

/** What the shadcn CLI would write for one file: after its own rewrites for this project (aliases, icons, base library, RTL). */
export type PreviewFile = { status: string; content: string }
export type Preview = Map<string, PreviewFile>

/** The two things this tool asks of shadcn. A seam, so tests can use a fake. */
export interface Shadcn {
  /** Installs the items for real: creates files, installs npm packages. Existing files are kept unless `overwrite`. */
  add(addresses: string[], opts?: { overwrite?: boolean; silent?: boolean }): Promise<void>
  /** What `add` would write, without writing it. */
  preview(address: string | string[]): Promise<Preview>
}

const stripAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "")

/**
 * Reads `shadcn add <item> --dry-run --view`, which prints every file as:
 *
 *   ├ src/components/ballmac/button.tsx (create) 84 lines
 *   │ ┌────────────
 *   │ │ <one line of the file>
 *   │ └────────────
 *
 * The line count in the header is checked against what was read, so a change in shadcn's output fails loudly
 * instead of producing a wrong merge.
 */
export function parsePreview(output: string): Preview {
  const lines = stripAnsi(output).split("\n")
  const files: Preview = new Map()
  for (let i = 0; i < lines.length; i++) {
    const header = /^├ (\S+) \(([\w-]+)\) (\d+) lines?$/.exec(lines[i]!)
    if (!header) continue
    if (!lines[i + 1]?.startsWith("│ ┌")) throw new CliError(`Could not read shadcn's preview of ${header[1]!}: the file box was missing.`)
    const content: string[] = []
    let j = i + 2
    for (; j < lines.length && !lines[j]!.startsWith("│ └"); j++) {
      const l = lines[j]!
      if (!l.startsWith("│ │")) throw new CliError(`Could not read shadcn's preview of ${header[1]!}: unexpected line.`)
      content.push(l.length > 4 ? l.slice(4) : "")
    }
    if (content.length !== Number(header[3])) {
      throw new CliError(`Could not read shadcn's preview of ${header[1]!}: expected ${header[3]!} lines, read ${content.length}. shadcn may have changed its output; update @ballmac/cli.`)
    }
    files.set(header[1]!, { status: header[2]!, content: content.join("\n") })
    i = j
  }
  return files
}

/** How to run the shadcn CLI: BALLMAC_SHADCN, then the project's own copy, then the package manager's runner. */
export function shadcnCommand(project: Project): string[] {
  const custom = process.env.BALLMAC_SHADCN?.trim()
  if (custom) return custom.split(/\s+/)
  const local = join(project.root, "node_modules/.bin/shadcn")
  if (existsSync(local)) return [local]
  switch (project.packageManager) {
    case "pnpm":
      return ["pnpm", "dlx", "shadcn@latest"]
    case "bun":
      return ["bunx", "--bun", "shadcn@latest"]
    case "yarn":
      return ["yarn", "dlx", "shadcn@latest"]
    default:
      return ["npx", "-y", "shadcn@latest"]
  }
}

export function realShadcn(project: Project, env: NodeJS.ProcessEnv = {}): Shadcn {
  const [cmd, ...base] = shadcnCommand(project)
  return {
    async add(addresses, opts = {}) {
      const code = await run(cmd!, [...base, "add", ...addresses, "-y", ...(opts.overwrite ? ["--overwrite"] : []), ...(opts.silent ? ["--silent"] : []), "--cwd", project.root], { cwd: project.root, env })
      if (code !== 0) throw new CliError(`shadcn exited with code ${code}.`)
    },
    async preview(address) {
      const addresses = Array.isArray(address) ? address : [address]
      const r = capture(cmd!, [...base, "add", ...addresses, "--dry-run", "--view", "-y", "--cwd", project.root], { cwd: project.root, env: { ...env, CI: "1", NO_COLOR: "1", FORCE_COLOR: "0" } })
      if (r.error) throw new CliError(`Could not run shadcn: ${r.error.message}`)
      if (r.code !== 0) throw new CliError(`shadcn could not preview ${addresses.join(" ")}:\n${(r.stderr || r.stdout).trim().split("\n").slice(-6).join("\n")}`)
      return parsePreview(r.stdout)
    },
  }
}
