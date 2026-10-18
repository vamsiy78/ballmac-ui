/**
 * The pictures on the changelog: for every entry with a `shot`, a WebP of that page in light and dark in apps/www/public/changelog/.
 *
 *   pnpm changelog:shots --base-url http://localhost:3000        capture what is missing
 *     --force                  capture everything again
 *     --filter roster,tickets  only entries whose file name contains one of these
 *
 * `shot: /preview/roster-1-demo` is a page of the running site. `shot: file:cli-update.html` is a static page in apps/www/content/changelog/shots/
 * (a terminal, for entries about the command line). With `shotSelector` the picture is that element instead of the top of the page.
 * Run it against the production build (`pnpm --filter @ballmac-ui/www start`) so it shows what visitors see.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { chromium } from "playwright"

import { getChangelog } from "../apps/www/lib/changelog"

const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const WWW = join(import.meta.dirname, "..", "apps/www")
const OUT = join(WWW, "public/changelog")
const base = (arg("base-url") ?? "http://localhost:3000").replace(/\/$/, "")
const force = process.argv.includes("--force")
const filter = arg("filter")?.split(",")
const SIZE = { width: 1280, height: 800 }

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined })
let done = 0
for (const entry of getChangelog()) {
  if (!entry.shot || (filter && !filter.some((f) => entry.slug.includes(f)))) continue
  for (const mode of ["light", "dark"] as const) {
    const file = join(OUT, `${entry.slug}.${mode}.webp`)
    if (!force && existsSync(file)) continue
    const context = await browser.newContext({ viewport: SIZE, deviceScaleFactor: 1, colorScheme: mode })
    const page = await context.newPage()
    await page.addInitScript((m) => localStorage.setItem("bm-theme", m), mode)
    await page.goto(entry.shot.startsWith("file:") ? pathToFileURL(join(WWW, "content/changelog/shots", entry.shot.slice(5))).href : `${base}${entry.shot}`, { waitUntil: "networkidle" })
    await page.evaluate(() => document.fonts.ready)
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}nextjs-portal{display:none!important}" })
    await page.waitForTimeout(500)
    let png: Buffer
    if (entry.shotSelector) {
      const box = await page.locator(entry.shotSelector).first().boundingBox()
      if (!box) throw new Error(`${entry.slug}: nothing matches ${entry.shotSelector} on ${entry.shot}`)
      const pad = 24
      png = await page.screenshot({ fullPage: true, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(SIZE.width, box.width + pad * 2), height: Math.min(box.height + pad * 2, 1100) } })
    } else png = await page.screenshot({ clip: { x: 0, y: 0, ...SIZE } })
    // Chromium encodes the WebP, so no image library is needed.
    const webp = await page.evaluate(
      async ({ b64 }) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext("2d")!.drawImage(img, 0, 0)
        const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/webp", 0.8))
        const buf = new Uint8Array(await blob.arrayBuffer())
        let s = ""
        for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000))
        return btoa(s)
      },
      { b64: png.toString("base64") }
    )
    writeFileSync(file, Buffer.from(webp, "base64"))
    await context.close()
    done++
  }
  console.log(`  ${entry.slug}`)
}
await browser.close()
console.log(`✓ ${done} picture(s) captured in apps/www/public/changelog/`)
