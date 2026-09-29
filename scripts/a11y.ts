import AxeBuilder from "@axe-core/playwright"
import { chromium } from "playwright"
import { spawn, type ChildProcess } from "node:child_process"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

type Item = { examples?: { name: string }[] }
type Finding = {
  page: string
  theme: string
  id: string
  impact: string
  nodes: string[]
}

const root = resolve(import.meta.dirname, "..")
const baseUrl = process.env.A11Y_BASE_URL ?? "http://127.0.0.1:3301"
const externalServer = Boolean(process.env.A11Y_BASE_URL)
const filter = process.argv.slice(2)
const index = JSON.parse(
  await readFile(resolve(root, "apps/www/lib/generated/index.json"), "utf8"),
) as Item[]
const names = [
  ...new Set(
    index.flatMap(
      (item) => item.examples?.map((example) => example.name) ?? [],
    ),
  ),
]
  .filter(
    (name) => filter.length === 0 || filter.some((part) => name.includes(part)),
  )
  .sort()

if (names.length === 0) {
  console.error("No preview examples matched the requested filter.")
  process.exit(1)
}

let server: ChildProcess | undefined
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined

try {
  if (!externalServer) {
    server = spawn(
      resolve(root, "apps/www/node_modules/.bin/next"),
      ["start", "-p", "3301"],
      {
        cwd: resolve(root, "apps/www"),
        stdio: "inherit",
      },
    )
  }

  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) {
        ready = true
        break
      }
    } catch {
      /* Server is still starting. */
    }
    if (server && server.exitCode !== null) break
    await new Promise((done) => setTimeout(done, 1000))
  }
  if (!ready)
    throw new Error(`Preview server did not become ready at ${baseUrl}`)

  browser = await chromium.launch({ headless: true })
  const findings: Finding[] = []
  let checked = 0
  let next = 0
  async function worker() {
    while (next < names.length) {
      const name = names[next++]
      for (const theme of ["light", "dark"]) {
        const context = await browser!.newContext({
          viewport: { width: 390, height: 844 },
        })
        await context.addInitScript((mode) => {
          localStorage.setItem("bm-theme", mode)
          document.documentElement.classList.toggle("dark", mode === "dark")
        }, theme)
        const page = await context.newPage()
        try {
          const response = await page.goto(
            `${baseUrl}/preview/${encodeURIComponent(name)}`,
            { waitUntil: "networkidle" },
          )
          if (!response?.ok())
            throw new Error(`HTTP ${response?.status() ?? "unknown"}`)
          await page.evaluate(() => document.fonts.ready)
          const result = await new AxeBuilder({ page })
            .withTags([
              "wcag2a",
              "wcag2aa",
              "wcag21a",
              "wcag21aa",
              "best-practice",
            ])
            .analyze()
          for (const violation of result.violations.filter(
            (v) => v.impact === "serious" || v.impact === "critical",
          )) {
            findings.push({
              page: name,
              theme,
              id: violation.id,
              impact: violation.impact!,
              nodes: violation.nodes.map((node) => node.target.join(" ")),
            })
          }
          checked++
        } catch (error) {
          findings.push({
            page: name,
            theme,
            id: "scan-error",
            impact: "critical",
            nodes: [String(error)],
          })
        } finally {
          await context.close()
        }
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(4, names.length) }, () => worker()),
  )
  for (const finding of findings)
    console.error(
      `${finding.page} (${finding.theme}): ${finding.impact} ${finding.id}\n  ${finding.nodes.join("\n  ")}`,
    )
  console.log(
    `Axe: ${checked}/${names.length * 2} previews checked across light and dark; ${findings.length} serious/critical violations or scan errors.`,
  )
  if (findings.length) process.exitCode = 1
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
