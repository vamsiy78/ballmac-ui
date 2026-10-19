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
import { checkCommand } from "./check.js"
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
import { verifyCommand } from "./verify-command.js"

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
  check [path…]          Audit your app for what agents and people get wrong: missing states,
                         unlabelled controls, fixed colours, endless motion, overflow on phones
        --rules            list the rules and exit
        --format <f>       pretty (default), json or github (annotations for CI)
        --fail-on <level>  error (default), warn or never: when to exit with 1
        --all              show every finding, not the first few per rule
        --offline          do not read the Ballmac catalogue
        --include-library  also audit components/ui and components/ballmac
        --url <address>    also load a running app in a real browser (axe, overflow, console)
        --routes <a,b>     routes to load with --url (default /)
  verify <registry>      Score any shadcn registry (a URL, a folder or a registry.json) on what can be
                         checked from its source, and write a badge. Needs TypeScript in this project.
        --min-score <n>    exit 1 when the score is below n (for CI)
        --format <f>       pretty (default) or json
        --out <file>       write the scorecard JSON
        --badge <file>     write the "Ballmac Verified" SVG badge
        --item-url <url>   where items live when it is not next to registry.json, e.g. https://acme.com/r/{name}.json
        --limit <n>        score only the first n items
        --all              list every item that lost points
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
    rules: { type: "boolean" },
    all: { type: "boolean" },
    offline: { type: "boolean" },
    "include-library": { type: "boolean" },
    format: { type: "string" },
    "fail-on": { type: "string" },
    url: { type: "string" },
    routes: { type: "string" },
    "min-score": { type: "string" },
    out: { type: "string" },
    badge: { type: "string" },
    "item-url": { type: "string" },
    limit: { type: "string" },
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

  // check works in any React project, not only one set up with shadcn.
  if (command === "check") {
    const format = (values.format as string | undefined) ?? "pretty"
    const failOn = (values["fail-on"] as string | undefined) ?? "error"
    if (!["pretty", "json", "github"].includes(format)) throw new CliError(`--format must be pretty, json or github, not "${format}".`)
    if (!["error", "warn", "never"].includes(failOn)) throw new CliError(`--fail-on must be error, warn or never, not "${failOn}".`)
    const { failed } = await checkCommand({
      cwd,
      paths: rest,
      format: format as "pretty" | "json" | "github",
      failOn: failOn as "error" | "warn" | "never",
      all: Boolean(values.all),
      rules: Boolean(values.rules),
      includeLibrary: Boolean(values["include-library"]),
      offline: Boolean(values.offline),
      url: values.url as string | undefined,
      routes: ((values.routes as string | undefined) ?? "").split(",").map((r) => r.trim()).filter(Boolean),
      out: (line) => console.log(line),
    })
    if (failed) process.exitCode = 1
    return
  }

  // verify reads a registry, not a project.
  if (command === "verify") {
    const format = (values.format as string | undefined) ?? "pretty"
    if (!["pretty", "json"].includes(format)) throw new CliError(`--format must be pretty or json, not "${format}".`)
    const num = (name: string) => {
      const raw = values[name] as string | undefined
      if (raw === undefined) return undefined
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0) throw new CliError(`--${name} must be a number, not "${raw}".`)
      return n
    }
    const { failed } = await verifyCommand({
      cwd,
      target: rest[0],
      format: format as "pretty" | "json",
      minScore: num("min-score"),
      limit: num("limit"),
      out: values.out as string | undefined,
      badge: values.badge as string | undefined,
      itemUrl: values["item-url"] as string | undefined,
      all: Boolean(values.all),
      print: (line) => console.log(line),
      tool: `@ballmac/cli ${version}`,
    })
    if (failed) process.exitCode = 1
    return
  }

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

