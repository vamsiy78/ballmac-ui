import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { registryItemSchema, registrySchema } from "shadcn/schema"
const dir = process.argv[2]
let ok = 0
let total = 0
const fail = (f: string, why: string) => console.log("✗", f, why)

for (const f of readdirSync(dir)) {
  if (statSync(`${dir}/${f}`).isDirectory()) continue // tests/ is checked below
  total++
  const data = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"))
  if (f === "versions.json") {
    // The manifest `ballmac outdated` reads: every item has a version, files and a changelog that starts with that version.
    const noFiles = new Set(["registry:theme", "registry:style", "registry:font"]) // themes are CSS variables only
    const bad = Object.entries<{ type?: string; version?: string; files?: unknown[]; changelog?: { version: string }[] }>(data.items ?? {}).filter(
      ([, i]) => !i.version || !Array.isArray(i.files) || (!i.files.length && !noFiles.has(i.type ?? "")) || (i.changelog?.length && i.changelog[0]!.version !== i.version)
    )
    if (data.schema !== 1 || !Object.keys(data.items ?? {}).length || bad.length) fail(f, `manifest invalid: ${bad.slice(0, 3).map(([n]) => n).join(", ")}`)
    else ok++
    continue
  }
  if (f === "base-manifest.json") {
    // Which items have a Base UI variant in base/: each is listed with the version of the item it replaces.
    const listed = (data.items ?? []) as { name: string; version: string }[]
    const missing = listed.filter((i) => !i.version || !existsSync(`${dir}/base/${i.name}.json`)).map((i) => i.name)
    if (data.schema !== 1 || !listed.length || missing.length) fail(f, `manifest invalid: ${missing.slice(0, 3).join(", ")}`)
    else ok++
    continue
  }
  const r = (f === "registry.json" ? registrySchema : registryItemSchema).safeParse(data)
  if (!r.success) { fail(f, JSON.stringify(r.error.issues.slice(0, 3))); continue }
  ok++
}

// Base UI variants: every file is a registry item.
if (existsSync(`${dir}/base`)) {
  for (const f of readdirSync(`${dir}/base`)) {
    total++
    const r = (f === "registry.json" ? registrySchema : registryItemSchema).safeParse(JSON.parse(readFileSync(`${dir}/base/${f}`, "utf8")))
    if (!r.success) fail(`base/${f}`, JSON.stringify(r.error.issues.slice(0, 3)))
    else ok++
  }
}

// Shipped tests: one JSON per item, with the file content and a version that matches the manifest.
const testsDir = `${dir}/tests`
if (existsSync(testsDir)) {
  const manifest = existsSync(`${dir}/versions.json`) ? JSON.parse(readFileSync(`${dir}/versions.json`, "utf8")).items : {}
  for (const f of readdirSync(testsDir)) {
    total++
    const t = JSON.parse(readFileSync(`${testsDir}/${f}`, "utf8"))
    if (f === "_setup.json") {
      if (t.file !== "setup.ts" || !t.content.includes("jest-dom")) fail(`tests/${f}`, "setup invalid")
      else ok++
      continue
    }
    const m = manifest[t.name]
    if (!t.content?.startsWith("// @vitest-environment jsdom") || !t.file?.endsWith(".test.tsx")) fail(`tests/${f}`, "test file invalid")
    else if (m && (m.version !== t.version || m.tests !== true)) fail(`tests/${f}`, "does not match versions.json")
    else ok++
  }
}
console.log(`${ok}/${total} files valid against shadcn/schema and the Ballmac manifests`)
if (ok !== total) process.exit(1)
