/**
 * Install smoke test: the registry's real contract.
 * Builds the registry for localhost, serves it, scaffolds a fresh Next.js app (src/ layout),
 * runs `shadcn init` then `shadcn add` for every free item and example, and finally
 * `tsc --noEmit` and `next build`. Any failure means users would hit it too.
 *
 * Usage: pnpm smoke   (SMOKE_DIR to reuse a folder, SMOKE_BASE=radix, SMOKE_CACHE_COMPONENTS=1 to keep Next.js 16.4's new defaults)
 */
import { execSync, spawn } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { ROOT } from "./lib"

const PORT = 4455
const BASE = `http://127.0.0.1:${PORT}`
const run = (cmd: string, cwd: string) =>
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, CI: "1" } })

run(
  `REGISTRY_URL=${BASE} node_modules/.bin/tsx scripts/build-registry.ts`,
  ROOT,
)

// The registry is served from a separate process: execSync below blocks this one.
const server = spawn(
  process.execPath,
  [
    join(ROOT, "scripts/serve-static.mjs"),
    join(ROOT, "apps/www/public"),
    String(PORT),
  ],
  { stdio: "ignore" },
)
await new Promise((r) => setTimeout(r, 500))
try {
  const dir =
    process.env.SMOKE_DIR ?? mkdtempSync(join(tmpdir(), "ballmac-smoke-"))
  run(
    `npx -y create-next-app@latest app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`,
    dir,
  )
  const app = join(dir, "app")
  // `create-next-app@latest` moves on: Next.js 16.4 turns on Cache Components, which rejects `new Date()` and similar reads during
  // prerender (react-day-picker's "today" in the calendar and date picker, for example). Ballmac UI is not compatible with that yet,
  // so the smoke test builds the Next.js version this repo pins, with the options that version defaults to.
  // SMOKE_CACHE_COMPONENTS=1 keeps the new defaults to see how far the gap goes.
  if (!process.env.SMOKE_CACHE_COMPONENTS) {
    const pinned = (JSON.parse(readFileSync(join(ROOT, "apps/www/package.json"), "utf8")) as { dependencies: Record<string, string> }).dependencies.next!
    run(`npm install next@${pinned} --save-exact --silent`, app)
    const config = join(app, "next.config.ts")
    writeFileSync(config, readFileSync(config, "utf8").replace(/^\s*(cacheComponents|partialPrefetching):.*\n/gm, ""))
  }
  // Default init uses Base UI (base-nova); SMOKE_BASE=radix tests a Radix project instead.
  run(
    `npx -y shadcn@latest init -d -y${process.env.SMOKE_BASE ? ` -b ${process.env.SMOKE_BASE}` : ""}`,
    app,
  )

  const registry = JSON.parse(
    readFileSync(join(ROOT, "apps/www/public/r/registry.json"), "utf8"),
  )
  const names: string[] = registry.items.map((i: { name: string }) => i.name)
  // The CLI cannot reliably resolve hundreds of URLs in one invocation.
  for (let offset = 0; offset < names.length; offset += 20) {
    const batch = names.slice(offset, offset + 20)
    run(
      `npx -y shadcn@latest add ${batch.map((n) => `${BASE}/r/${n}.json`).join(" ")} -y --overwrite`,
      app,
    )
  }

  // Render every example on one page so next build type-checks and prerenders them all.
  const examples = registry.items.filter(
    (i: { type: string }) => i.type === "registry:example",
  )
  const imports = examples.map(
    (e: { name: string }, i: number) =>
      `import E${i} from "@/components/ballmac/examples/${e.name}"`,
  )
  writeFileSync(
    join(app, "src/app/page.tsx"),
    `${imports.join("\n")}\n\nexport default function Page() {\n  return (\n    <main className="grid gap-8 p-8">\n${examples.map((_: unknown, i: number) => `      <E${i} />`).join("\n")}\n    </main>\n  )\n}\n`,
  )
  run(`npx tsc --noEmit`, app)
  run(`npx next build`, app)
  console.log(
    `\n✓ Smoke test passed: ${names.length} registry entries installed, typechecked and built (${app})`,
  )
} finally {
  server.kill()
  // Restore the production registry URLs in apps/www/public/r.
  execSync(`node_modules/.bin/tsx scripts/build-registry.ts`, {
    cwd: ROOT,
    stdio: "ignore",
  })
}
