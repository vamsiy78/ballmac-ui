/**
 * Gallery thumbnails: a small WebP of every block and template, in light and dark, so the galleries show pictures instead of
 * mounting dozens of live pages (which cost seconds of main-thread time on a phone).
 *
 *   pnpm thumbs --base-url http://localhost:3700           capture what is missing or changed
 *   pnpm thumbs --base-url http://localhost:3700 --check   list stale or missing thumbnails and exit 1 if there are any
 *     --filter hero-pro,template-orbit   only items whose name starts with one of these
 *     --force                            recapture everything
 *
 * Needs the production site running (with Pro mounted to capture Pro items) and Playwright's Chromium.
 * Free thumbnails go to apps/www/public/thumbs (committed). Pro thumbnails go to registry/pro/thumbs (the private repo) and
 * `pnpm build:registry` copies them to apps/www/public/thumbs/pro (git-ignored), so the public repo never carries them.
 * thumbs.json beside each folder records a hash of the rendered page, so only changed pages are captured again.
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { chromium, type BrowserContext } from "playwright"

const ROOT = join(import.meta.dirname, "..")
const arg = (n: string, d?: string) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const flag = (n: string) => process.argv.includes(`--${n}`)

/** The page is laid out 1280 wide and cropped to this height; the gallery shows it at the same aspect ratio. */
export const THUMB = { width: 1280, heights: { blocks: 640, templates: 840 }, outWidth: 800 } as const
export const MODES = ["light", "dark"] as const

type Item = { name: string; category: string; tier: string; examples: { name: string }[] }
export const thumbDir = (tier: string) => (tier === "pro" ? join(ROOT, "registry/pro/thumbs") : join(ROOT, "apps/www/public/thumbs"))
export const thumbFile = (name: string, mode: string) => `${name}.${mode}.webp`

/** Items that get a thumbnail: blocks and templates with a first example. */
export function thumbItems(items: Item[]) {
  return items.filter((i) => (i.category === "blocks" || i.category === "templates") && i.examples.length > 0)
}

type Manifest = Record<string, string>
const readManifest = (dir: string): Manifest => {
  try {
    return JSON.parse(readFileSync(join(dir, "thumbs.json"), "utf8"))
  } catch {
    return {}
  }
}

async function render(context: BrowserContext, base: string, example: string, mode: string) {
  const page = await context.newPage()
  await page.addInitScript((m) => localStorage.setItem("bm-theme", m), mode)
  await page.goto(`${base}/preview/${example}`, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" })
  await page.waitForTimeout(400)
  return page
}

async function main() {
  const base = (arg("base-url") ?? "http://localhost:3700").replace(/\/$/, "")
  const filter = arg("filter")?.split(",")
  const force = flag("force")
  const check = flag("check")
  const index = (JSON.parse(readFileSync(join(ROOT, "apps/www/lib/generated/index.json"), "utf8")) as Item[]).filter((i) => !filter || filter.some((f) => i.name.startsWith(f)))
  const items = thumbItems(index)

  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined })
  const stale: string[] = []
  let done = 0
  for (const item of items) {
    const dir = thumbDir(item.tier)
    mkdirSync(dir, { recursive: true })
    const manifest = readManifest(dir)
    const example = item.examples[0]!.name
    const height = THUMB.heights[item.category as "blocks" | "templates"]
    const context = await browser.newContext({ viewport: { width: THUMB.width, height }, deviceScaleFactor: 1 })
    try {
      const probe = await render(context, base, example, "light")
      // Hash the markup with scripts and volatile attributes removed, so unchanged pages are skipped.
      const html = (await probe.content()).replace(/<script[\s\S]*?<\/script>/g, "").replace(/\s(?:id|aria-controls|aria-labelledby|for)="[^"]*(?:_R_|:r)[^"]*"/g, "")
      const hash = createHash("sha256").update(html).digest("hex").slice(0, 16)
      const missing = MODES.some((m) => !existsSync(join(dir, thumbFile(item.name, m))))
      if (!force && !missing && manifest[item.name] === hash) {
        await probe.close()
        continue
      }
      stale.push(item.name)
      if (check) {
        await probe.close()
        continue
      }
      await probe.close()
      for (const mode of MODES) {
        const page = await render(context, base, example, mode)
        const png = await page.screenshot({ clip: { x: 0, y: 0, width: THUMB.width, height } })
        // Chromium encodes the WebP, so no image library is needed.
        const webp = await page.evaluate(
          async ({ b64, w }) => {
            const img = new Image()
            img.src = `data:image/png;base64,${b64}`
            await img.decode()
            const canvas = document.createElement("canvas")
            canvas.width = w
            canvas.height = Math.round((img.height * w) / img.width)
            const ctx = canvas.getContext("2d")!
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/webp", 0.72))
            const buf = new Uint8Array(await blob.arrayBuffer())
            let s = ""
            for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000))
            return btoa(s)
          },
          { b64: png.toString("base64"), w: THUMB.outWidth }
        )
        writeFileSync(join(dir, thumbFile(item.name, mode)), Buffer.from(webp, "base64"))
        await page.close()
      }
      manifest[item.name] = hash
      writeFileSync(join(dir, "thumbs.json"), JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + "\n")
      done++
      if (done % 10 === 0) console.log(`  ${done} captured…`)
    } finally {
      await context.close()
    }
  }
  await browser.close()
  if (check) {
    if (stale.length) {
      console.error(`${stale.length} thumbnail(s) missing or out of date:\n  ${stale.join("\n  ")}\nRun: pnpm thumbs --base-url ${base}`)
      process.exit(1)
    }
    console.log(`All ${items.length} thumbnails are current.`)
    return
  }
  console.log(`Captured ${done} item(s); ${items.length - stale.length} were already current.`)
}

if (import.meta.filename === process.argv[1]) void main()
