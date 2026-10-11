#!/usr/bin/env node
/**
 * @ballmac/cli: keeps Ballmac UI components up to date without losing your edits, and installs the tests that ship with them.
 * It sits next to the shadcn CLI: shadcn installs the files, this tool remembers what it installed and merges new versions into your copies.
 * Env: BALLMAC_UI_URL (default https://ui.ballmac.com), BALLMAC_LICENSE_KEY (Pro), BALLMAC_SHADCN (how to run shadcn).
 */
import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { parseArgs } from "node:util"

import { addItems } from "./add.js"
import type { Ctx } from "./ctx.js"
import { diffItem } from "./diff.js"
import { lockPath } from "./lock.js"
import { outdatedCommand } from "./outdated.js"
import { findRoot, loadProject, readEnvFile } from "./project.js"
import { DEFAULT_REGISTRY, Registry } from "./registry.js"
import { realShadcn } from "./shadcn.js"
import { installTests, runTests } from "./tests.js"
import { trackItems } from "./track.js"
import { updateItems } from "./update.js"
import { CliError, c } from "./util.js"

const { version } = createRequire(import.meta.url)("../package.json") as { version: string }

const HELP = `ballmac ${version}: update Ballmac UI components without losing your changes, and install their tests.

Usage: ballmac <command> [options]

  add <item…>            Install items with shadcn and start tracking them
        --with-tests       also install the tests that ship with the items
        --no-install       do not install the test packages (print them instead)
  outdated [item…]       Which tracked items have a newer version, and what changed
        --json             machine-readable output
        --exit-code        exit 1 when something is behind (for CI)
  update [item…]         Merge new versions into your copies (your edits are kept)
        --dry-run          show what would change and write nothing
  diff <item>            What you changed since you installed an item
  track [item…]          Start tracking items you installed with plain shadcn
        --rebase           declare your files up to date with the latest version
  test [item…]           Run the Ballmac tests installed in this project
  test add <item…>       Install the tests for items that are already installed

Options:
  --cwd <dir>            Project folder (default: the current folder)
  -v, --version          Print the version
  -h, --help             Print this help

Environment:
  BALLMAC_UI_URL         Registry to read (default ${DEFAULT_REGISTRY})
  BALLMAC_LICENSE_KEY    Your Ballmac UI Pro key (env or .env.local); needed for Pro items
  BALLMAC_SHADCN         How to run shadcn, e.g. "pnpm dlx shadcn@latest" (default: your local copy, else the package manager's runner)

Docs: https://ui.ballmac.com/docs/cli`

const { values, positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    "with-tests": { type: "boolean" },
    "no-install": { type: "boolean" },
    json: { type: "boolean" },
    "exit-code": { type: "boolean" },
    "dry-run": { type: "boolean" },
    rebase: { type: "boolean" },
    cwd: { type: "string" },
    version: { type: "boolean", short: "v" },
    help: { type: "boolean", short: "h" },
  },
})

async function main() {
  const [command, ...rest] = positionals
  if (values.version) return console.log(version)
  if (values.help || !command || command === "help") return console.log(HELP)

  const cwd = (values.cwd as string | undefined) ?? process.cwd()
  const root = findRoot(cwd)
  // The registry a project was set up with wins over the default, so a project made against a preview keeps using it.
  const recorded = existsSync(lockPath(root)) ? (JSON.parse(readFileSync(lockPath(root), "utf8")) as { registry?: string }).registry : undefined
  const licenseKey = process.env.BALLMAC_LICENSE_KEY ?? readEnvFile(root, "BALLMAC_LICENSE_KEY")
  const registry = new Registry(process.env.BALLMAC_UI_URL ?? recorded ?? DEFAULT_REGISTRY, licenseKey)
  const project = loadProject(cwd)
  const ctx: Ctx = {
    project,
    registry,
    shadcn: realShadcn(project, licenseKey ? { BALLMAC_LICENSE_KEY: licenseKey } : {}),
    out: (line) => console.log(line),
    warn: (line) => console.error(line),
    dryRun: Boolean(values["dry-run"]),
  }

  switch (command) {
    case "add":
      if (!rest.length) throw new CliError("Name at least one item: ballmac add button dialog")
      return addItems(ctx, rest, { withTests: Boolean(values["with-tests"]), installDev: values["no-install"] ? false : undefined })
    case "outdated": {
      const behind = await outdatedCommand(ctx, rest, { json: Boolean(values.json) })
      if (values["exit-code"] && behind) process.exitCode = 1
      return
    }
    case "update": {
      const { conflicts } = await updateItems(ctx, rest)
      if (conflicts) process.exitCode = 1
      return
    }
    case "diff":
      if (rest.length !== 1) throw new CliError("Name one item: ballmac diff button")
      return void (await diffItem(ctx, rest[0]!))
    case "track":
      return trackItems(ctx, rest, { rebase: Boolean(values.rebase) })
    case "test":
      if (rest[0] === "add") {
        if (rest.length < 2) throw new CliError("Name at least one item: ballmac test add button")
        return installTests(ctx, rest.slice(1), { installDev: values["no-install"] ? false : undefined })
      }
      return runTests(ctx, rest)
    default:
      throw new CliError(`Unknown command "${command}". Run ballmac --help.`)
  }
}

main().catch((e: unknown) => {
  if (e instanceof CliError) console.error(c.red(`✗ ${e.message}`))
  else console.error(c.red("✗ Unexpected error:"), e)
  process.exit(1)
})

