import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { addItems } from "./add.js"
import { assertKnown } from "./catalogue.js"
import { readText, type Ctx } from "./ctx.js"
import { readLock, saveBase, writeLock } from "./lock.js"
import { absolute, testsDir } from "./project.js"
import { CliError, c, run, writeFile } from "./util.js"

/** The shipped tests import components through "@/…". Projects with another alias prefix (for example "~") get theirs. */
export function rewriteImports(content: string, prefix: string) {
  if (prefix === "@") return content
  return content.replace(/(from\s+|mock\(\s*)"@\//g, `$1"${prefix}/`)
}

const VITEST_CONFIGS = ["ts", "mts", "cts", "js", "mjs", "cjs"].map((e) => `vitest.config.${e}`)

export function hasVitestConfig(root: string) {
  if (VITEST_CONFIGS.some((f) => existsSync(join(root, f)))) return true
  return ["ts", "mts", "js", "mjs"].some((e) => {
    const f = join(root, `vite.config.${e}`)
    return existsSync(f) && /\btest\s*:/.test(readFileSync(f, "utf8"))
  })
}

function vitestConfig(aliasRoot: string, prefix: string) {
  const alias = prefix === "@" ? `"@"` : JSON.stringify(prefix)
  return `import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// Created by \`ballmac add --with-tests\`. Ballmac's tests render components in jsdom and import them through your ${alias} alias.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { ${alias}: fileURLToPath(new URL("./${aliasRoot}", import.meta.url)) } },
  test: { include: ["**/__tests__/**/*.test.{ts,tsx}"], exclude: ["node_modules/**", ".next/**", ".ballmac/**"] },
})
`
}

function missingDevDependencies(ctx: Ctx, wanted: string[]) {
  const pkg = JSON.parse(readFileSync(join(ctx.project.root, "package.json"), "utf8")) as Record<string, Record<string, string> | undefined>
  const have = { ...pkg.dependencies, ...pkg.devDependencies }
  const nameOf = (spec: string) => spec.replace(/(?<=.)@[^@/]*$/, "")
  return wanted.filter((d) => !have[nameOf(d)])
}

async function installDevDependencies(ctx: Ctx, missing: string[]) {
  if (!missing.length) return
  const pm = ctx.project.packageManager
  const cmd = { pnpm: ["pnpm", "add", "-D"], npm: ["npm", "install", "-D"], yarn: ["yarn", "add", "-D"], bun: ["bun", "add", "-d"] }[pm]
  ctx.out(c.dim(`${cmd.join(" ")} ${missing.join(" ")}`))
  const code = await run(cmd[0]!, [...cmd.slice(1), ...missing], { cwd: ctx.project.root })
  if (code !== 0) throw new CliError(`Installing ${missing.join(", ")} failed (exit ${code}). Install them yourself and run this again.`)
}

/**
 * Installs the tests that ship with items: `__tests__/<item>.test.tsx` next to the components, the shared `__tests__/setup.ts`, and the
 * packages they need. A test is a normal vitest file; it runs with `npx vitest run`.
 */
export async function installTests(ctx: Ctx, names: string[], opts: { installDev?: boolean } = {}) {
  const catalogue = await ctx.registry.catalogue()
  assertKnown(catalogue, names, Boolean(ctx.registry.licenseKey))
  const withTests = names.filter((n) => catalogue[n]!.tests)
  for (const n of names.filter((n) => !catalogue[n]!.tests)) {
    ctx.out(c.yellow(`No test ships with ${n} yet.`) + c.dim(catalogue[n]!.tier === "pro" ? " (Pro tests cover whole batches of blocks and are not split per item.)" : ""))
  }
  if (!withTests.length) return

  const setup = await ctx.registry.testSetup()
  const dir = testsDir(ctx.project)
  const lock = readLock(ctx.project.root, ctx.registry.base)
  const wanted = new Set(setup.devDependencies)
  let written = 0

  const setupPath = `${dir}/${setup.file}`
  if (readText(ctx, setupPath) === null) writeFile(absolute(ctx.project, setupPath), setup.content)
  lock.items["ballmac-test-setup"] = lock.items["ballmac-test-setup"] ?? {
    version: "1.0.0",
    tier: "free",
    installedAt: (ctx.now?.() ?? new Date()).toISOString(),
    files: { [setupPath]: { base: saveBase(ctx.project.root, setup.content), kind: "test" } },
  }

  for (const name of withTests) {
    const t = await ctx.registry.test(name)
    // A test may use one other Ballmac item (a switch test renders a label). Install it first.
    const missing = t.requires.filter((r) => !lock.items[r])
    if (missing.length) {
      writeLock(ctx.project.root, lock)
      await addItems(ctx, missing)
      Object.assign(lock, readLock(ctx.project.root, ctx.registry.base))
    }
    const content = rewriteImports(t.content, ctx.project.importPrefix)
    const rel = `${dir}/${t.file}`
    const current = readText(ctx, rel)
    const item = lock.items[name]
    if (current !== null && !item?.files[rel]) {
      ctx.out(c.yellow(`${rel} already exists and is not tracked; left as it is.`))
      continue
    }
    if (current === null) {
      writeFile(absolute(ctx.project, rel), content)
      written++
    }
    if (item) item.files[rel] = item.files[rel] ?? { base: saveBase(ctx.project.root, content), kind: "test" }
    t.devDependencies.forEach((d) => wanted.add(d))
  }
  writeLock(ctx.project.root, lock)

  const componentsDir = ctx.project.aliasDir(`${ctx.project.importPrefix}/components`)
  const aliasRoot = componentsDir === "components" ? "." : componentsDir.replace(/\/components$/, "")
  if (!hasVitestConfig(ctx.project.root)) {
    writeFile(join(ctx.project.root, "vitest.config.mts"), vitestConfig(aliasRoot, ctx.project.importPrefix))
    ctx.out(c.dim("Created vitest.config.mts"))
  } else {
    ctx.out(c.dim(`You already have a vitest config. The tests need: @vitejs/plugin-react, an alias "${ctx.project.importPrefix}" → ./${aliasRoot}, include: **/__tests__/**/*.test.tsx, and exclude: .ballmac/**`))
  }
  ctx.out(c.green(`✓ ${written} test file(s) installed in ${dir}`) + c.dim(`  Run them: npx vitest run ${withTests[0]}`))
  const missingDev = missingDevDependencies(ctx, [...wanted])
  if (opts.installDev === false) {
    if (missingDev.length) ctx.out(c.yellow(`Install the test packages: ${missingDev.join(" ")}`))
  } else await installDevDependencies(ctx, missingDev)
}

/** Lists the test files `ballmac` installed, for `ballmac test`. */
export function installedTests(ctx: Ctx) {
  const lock = readLock(ctx.project.root, ctx.registry.base)
  return Object.entries(lock.items).flatMap(([name, item]) => Object.entries(item.files).filter(([, f]) => f.kind === "test" && !name.startsWith("ballmac-test-")).map(([path]) => ({ name, path })))
}

export async function runTests(ctx: Ctx, names: string[]) {
  const tests = installedTests(ctx).filter((t) => !names.length || names.includes(t.name))
  if (!tests.length) throw new CliError("No Ballmac tests are installed. Add some with: ballmac add <item> --with-tests")
  const pm = ctx.project.packageManager
  const runner = { pnpm: ["pnpm", "exec"], npm: ["npx"], yarn: ["yarn"], bun: ["bunx"] }[pm]
  const code = await run(runner[0]!, [...runner.slice(1), "vitest", "run", "--exclude", ".ballmac/**", ...tests.map((t) => t.path)], { cwd: ctx.project.root })
  if (code !== 0) throw new CliError(`Tests failed (exit ${code}).`)
}
