import { createRequire } from "node:module"
import { join } from "node:path"

import { CliError } from "./util.js"
import type { Style } from "./vendor/audit/index.js"

export type RuntimeFinding = {
  rule: "runtime/axe" | "runtime/overflow" | "runtime/console-error" | "runtime/load"
  route: string
  theme: "light" | "dark"
  width: number
  message: string
  /** CSS selectors of the elements involved (axe), at most three. */
  nodes?: string[]
}
export type RuntimeReport = {
  url: string
  routes: string[]
  /** Page loads checked: routes × themes × widths. */
  pages: number
  findings: RuntimeFinding[]
  tool: { axe?: string; browser?: string }
}

// Only the little of Playwright and axe-core this uses, so the CLI needs neither as a dependency.
type Page = {
  goto(url: string, o: object): Promise<unknown>
  evaluate<T>(fn: string | (() => T | Promise<T>)): Promise<T>
  addScriptTag(o: { content: string }): Promise<unknown>
  on(event: string, cb: (arg: { type?: () => string; text?: () => string; message?: string } & Error) => void): void
}
type Browser = { newContext(o: object): Promise<{ newPage(): Promise<Page>; close(): Promise<void> }>; close(): Promise<void>; version(): string }
type Playwright = { chromium: { launch(o: object): Promise<Browser> } }
type Axe = { source: string; version?: string }

const INSTALL = "Install them in this project with:  npm i -D playwright axe-core  &&  npx playwright install chromium  (or @axe-core/playwright, which brings axe-core)"

/** Playwright and axe-core from the project being checked (so its versions are used), else from beside this tool. */
export function loadRuntimeDeps(root: string, bases: string[] = [join(root, "package.json"), import.meta.url]): { playwright: Playwright; axe: Axe } {
  const find = <T>(names: string[]): T | undefined => {
    for (const base of bases)
      for (const name of names) {
        try {
          return createRequire(base)(name) as T
        } catch {
          /* try the next */
        }
      }
    return undefined
  }
  const playwright = find<Playwright>(["playwright", "playwright-core", "@playwright/test"])
  let axe = find<Axe>(["axe-core"])
  if (!axe?.source) {
    // @axe-core/playwright is common and brings its own axe-core, which may not be visible from the project root (pnpm).
    for (const base of bases) {
      try {
        const via = createRequire(base).resolve("@axe-core/playwright")
        axe = createRequire(via)("axe-core") as Axe
        break
      } catch {
        /* try the next */
      }
    }
  }
  if (!playwright || !axe?.source) throw new CliError(`The browser check needs ${!playwright && !axe ? "playwright and axe-core" : !playwright ? "playwright" : "axe-core"}, which this project does not have. ${INSTALL}`)
  return { playwright, axe }
}

/**
 * Loads a running app in a real browser and checks what a static read cannot: accessibility violations (axe-core, serious and critical),
 * sideways scrolling on a phone, and errors in the console (including React hydration errors). Each route is checked in light and dark
 * (through the browser's colour-scheme setting) at 390 and 1280 px wide.
 */
export async function runtimeCheck(opts: { root: string; url: string; routes: string[]; widths?: number[]; deps?: { playwright: Playwright; axe: Axe } }): Promise<RuntimeReport> {
  const { playwright, axe } = opts.deps ?? loadRuntimeDeps(opts.root)
  const base = opts.url.replace(/\/+$/, "")
  const routes = opts.routes.length ? opts.routes : ["/"]
  const widths = opts.widths ?? [390, 1280]
  let browser: Browser
  try {
    browser = await playwright.chromium.launch({ headless: true })
  } catch (e) {
    throw new CliError(`Could not start a browser: ${(e as Error).message.split("\n")[0]}. Run:  npx playwright install chromium`)
  }
  const findings: RuntimeFinding[] = []
  let pages = 0
  try {
    for (const route of routes) {
      for (const theme of ["light", "dark"] as const) {
        for (const width of widths) {
          pages++
          const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme })
          const page = await context.newPage()
          const errors: string[] = []
          page.on("console", (m) => {
            const text = m.text?.() ?? ""
            if (m.type?.() === "error" && !/favicon|Failed to load resource.*(404|net::ERR)/i.test(text)) errors.push(text.split("\n")[0]!.slice(0, 200))
          })
          page.on("pageerror", (e) => errors.push(String(e.message ?? e).split("\n")[0]!.slice(0, 200)))
          const at = (message: string, rule: RuntimeFinding["rule"], nodes?: string[]) => findings.push({ rule, route, theme, width, message, ...(nodes?.length ? { nodes: nodes.slice(0, 3) } : {}) })
          try {
            await page.goto(`${base}${route.startsWith("/") ? route : `/${route}`}`, { waitUntil: "networkidle", timeout: 30_000 })
          } catch (e) {
            at(`Could not load the page: ${(e as Error).message.split("\n")[0]}`, "runtime/load")
            await context.close()
            continue
          }
          await page.addScriptTag({ content: axe.source })
          const result = await page.evaluate<{ violations: { id: string; impact: string | null; help: string; nodes: { target: string[] }[] }[] }>(
            "axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })"
          )
          for (const v of result.violations.filter((x) => x.impact === "serious" || x.impact === "critical"))
            at(`${v.id}: ${v.help} (${v.nodes.length} element${v.nodes.length === 1 ? "" : "s"})`, "runtime/axe", v.nodes.map((n) => n.target.join(" ")))
          const sizes = await page.evaluate<{ scroll: number; client: number }>("({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })")
          if (width <= 480 && sizes.scroll > sizes.client + 1) at(`The page scrolls sideways: content is ${sizes.scroll}px wide in a ${sizes.client}px window.`, "runtime/overflow")
          for (const message of [...new Set(errors)].slice(0, 3)) at(`Console error: ${message}`, "runtime/console-error")
          await context.close()
        }
      }
    }
    return { url: base, routes, pages, findings, tool: { axe: axe.version, browser: browser.version() } }
  } finally {
    await browser.close()
  }
}

export function summariseRuntime(r: RuntimeReport, st: Style) {
  const out = [st.bold("browser check") + st.dim(`  ·  ${r.pages} page load${r.pages === 1 ? "" : "s"} (${r.routes.join(", ")}) in light and dark`)]
  if (!r.findings.length) return [...out, st.green("✓ No accessibility violations, sideways scrolling or console errors.")].join("\n")
  for (const f of r.findings) {
    out.push("")
    out.push(`${st.red("error")} ${st.bold(f.rule)}  ${f.route}  ${st.dim(`${f.theme}, ${f.width}px`)}`)
    out.push(`  ${f.message}`)
    for (const n of f.nodes ?? []) out.push(st.dim(`    ${n}`))
  }
  return out.join("\n")
}
