/**
 * JPEG copies of the gallery thumbnails for the share images (Open Graph). The share image renderer (next/og) reads PNG and
 * JPEG but not WebP, so this converts each light thumbnail once, in Playwright's Chromium (no extra image library).
 *
 *   pnpm og:thumbs           convert what is missing or older than its WebP
 *
 * Reads apps/www/public/thumbs and apps/www/public/thumbs/pro (run `pnpm build:registry` first for the Pro ones) and
 * writes apps/www/.og-thumbs/<name>.jpg (git-ignored). When Chromium is not installed it warns and exits 0: the share
 * images then fall back to the text-only card.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { chromium } from "playwright"

const ROOT = join(import.meta.dirname, "..")
const OUT = join(ROOT, "apps/www/.og-thumbs")
const DIRS = [join(ROOT, "apps/www/public/thumbs"), join(ROOT, "apps/www/public/thumbs/pro")]

const todo: { src: string; out: string }[] = []
for (const dir of DIRS) {
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".light.webp")) continue
    const src = join(dir, f)
    const out = join(OUT, f.replace(/\.light\.webp$/, ".jpg"))
    if (!existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs) todo.push({ src, out })
  }
}

if (!todo.length) {
  console.log("✓ Share-image thumbnails are up to date")
  process.exit(0)
}

mkdirSync(OUT, { recursive: true })
let browser
try {
  browser = await chromium.launch()
} catch (e) {
  console.warn(`! Share-image thumbnails skipped: Chromium is not available (${(e as Error).message.split("\n")[0]})`)
  process.exit(0)
}
const page = await browser.newPage()
for (const { src, out } of todo) {
  const b64 = readFileSync(src).toString("base64")
  const jpeg = await page.evaluate(async (data) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/webp;base64,${data}`)).blob())
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0)
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.86 })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let s = ""
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    return btoa(s)
  }, b64)
  writeFileSync(out, Buffer.from(jpeg, "base64"))
}
await browser.close()
console.log(`✓ ${todo.length} share-image thumbnail(s) → apps/www/.og-thumbs`)
