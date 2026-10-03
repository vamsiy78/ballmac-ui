/**
 * Launch readiness check for the Pro registry.
 *
 *   pnpm launch:check                       against the current environment (set production values to mirror Vercel)
 *   pnpm launch:check --live [--key K]      also calls the licence provider (bogus key must be rejected; --key must be accepted)
 *
 * Exit 1 when something that would break or weaken a production launch is missing.
 */
import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = join(import.meta.dirname, "..")

export type Check = { level: "ok" | "warn" | "fail"; msg: string }
export type CheckInput = { env: Record<string, string | undefined>; proSource: number; proBuilt: number; production: boolean }

export function evaluate({ env, proSource, proBuilt, production }: CheckInput): Check[] {
  const out: Check[] = []
  const add = (level: Check["level"], msg: string) => out.push({ level, msg })
  const need = (cond: unknown, msg: string, lvl: "fail" | "warn" = production ? "fail" : "warn") => (cond ? add("ok", msg) : add(lvl, msg))
  const provider = (env.BALLMAC_LICENSE_PROVIDER ?? "").toLowerCase()

  need(proSource > 0, `Pro source present (${proSource} items)`)
  need(proBuilt > 0 && proBuilt >= proSource, `Private registry built (${proBuilt} files for ${proSource} items)`)
  const dodoName = provider === "dodopayments" || provider === "dodo"
  need(provider === "lemonsqueezy" || provider === "polar" || dodoName, `Licence provider configured (${provider || "none"})`)
  if (provider === "lemonsqueezy") {
    need(env.LEMONSQUEEZY_STORE_ID, "LEMONSQUEEZY_STORE_ID set")
    need(env.LEMONSQUEEZY_PRODUCT_IDS, "LEMONSQUEEZY_PRODUCT_IDS set (otherwise any key from your store unlocks Pro)")
  }
  if (provider === "polar") {
    need(env.POLAR_ORGANIZATION_ID, "POLAR_ORGANIZATION_ID set")
    need(env.POLAR_BENEFIT_IDS, "POLAR_BENEFIT_IDS set (otherwise any key from your organisation unlocks Pro)")
  }
  if (dodoName) {
    need(env.DODO_MODE !== "test" || !production, "DODO_MODE is not \"test\" in production")
    need(env.DODO_PRODUCT_IDS, "DODO_PRODUCT_IDS set (otherwise any licence key from this Dodo account unlocks Pro; confirm with --live that the answer names the product)", "warn")
  }
  need(!env.BALLMAC_PRO_TEST_KEYS || !production, "BALLMAC_PRO_TEST_KEYS empty in production (ignored by the server, but remove it)", "warn")
  const checkout = env.NEXT_PUBLIC_PRO_CHECKOUT_URL
  need(checkout?.startsWith("https://"), "NEXT_PUBLIC_PRO_CHECKOUT_URL is an https URL")
  need(!checkout || env.NEXT_PUBLIC_PRO_PRICE, "NEXT_PUBLIC_PRO_PRICE set (confirmed by the owner)")
  const team = env.NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL
  need(!team || (team.startsWith("https://") && env.NEXT_PUBLIC_PRO_TEAM_PRICE), "Team checkout URL and price set together", "warn")
  need(env.NEXT_PUBLIC_PRO_LICENSE_URL?.startsWith("https://"), "NEXT_PUBLIC_PRO_LICENSE_URL points at the Pro licence terms")
  if (process.env.CI) need(env.PRO_REPO_TOKEN, "PRO_REPO_TOKEN available to CI")
  return out
}

async function live(env: Record<string, string | undefined>, key?: string) {
  const { createLicenseValidator } = await import("../apps/www/lib/license-core")
  const v = createLicenseValidator({ ...env, BALLMAC_PRO_TEST_KEYS: "", VERCEL_ENV: "production" } as never)
  const out: Check[] = []
  try {
    const bogus = await v("bogus-key-0000-0000-0000")
    out.push(bogus.valid ? { level: "fail", msg: "provider accepted a bogus key" } : { level: "ok", msg: "provider rejects a bogus key" })
    if (key) {
      const good = await v(key)
      out.push(good.valid ? { level: "ok", msg: "provider accepts the supplied key" } : { level: "fail", msg: `provider rejected the supplied key: ${good.reason}` })
    }
    // Dodo's validate answer may or may not name the product. Show what it contains so product restriction can be judged.
    const provider = (env.BALLMAC_LICENSE_PROVIDER ?? "").toLowerCase()
    if ((provider === "dodopayments" || provider === "dodo") && key) {
      const base = env.DODO_API_URL ?? (env.DODO_MODE === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com")
      const res = await fetch(`${base}/licenses/validate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ license_key: key }) })
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
      const named = Object.keys(body).some((k) => /product/i.test(k))
      out.push({ level: named ? "ok" : "warn", msg: `Dodo answer fields: ${Object.keys(body).join(", ") || "(none)"}${named ? "" : ". It does not name the product, so DODO_PRODUCT_IDS cannot restrict keys: sell Pro from a Dodo business where Pro is the only licensed product"}` })
    }
  } catch (e) {
    out.push({ level: "fail", msg: `provider unreachable: ${(e as Error).message}` })
  }
  return out
}

function countMeta(dir: string): number {
  if (!existsSync(dir)) return 0
  return readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? countMeta(join(dir, e.name)) : e.name.endsWith(".meta.ts") ? 1 : 0), 0)
}

async function main() {
  const production = process.env.VERCEL_ENV === "production" || process.env.BALLMAC_REQUIRE_PRO === "1" || process.argv.includes("--production")
  const built = join(ROOT, "apps/www/.registry-pro")
  const proBuilt = existsSync(built) ? readdirSync(built).filter((f) => f.endsWith(".json") && f !== "registry.json").length : 0
  let checks = evaluate({ env: process.env, proSource: countMeta(join(ROOT, "registry/pro/ballmac")), proBuilt, production })
  if (process.argv.includes("--live")) {
    const i = process.argv.indexOf("--key")
    checks = checks.concat(await live(process.env, i > -1 ? process.argv[i + 1] : process.env.BALLMAC_VERIFY_KEY))
  }
  const icon = { ok: "✓", warn: "!", fail: "✗" }
  for (const c of checks) console.log(`${icon[c.level]} ${c.msg}`)
  const fails = checks.filter((c) => c.level === "fail").length
  const warns = checks.filter((c) => c.level === "warn").length
  console.log(`\nlaunch:check ${production ? "(production) " : ""}${fails ? `failed: ${fails} problem(s)` : "passed"}${warns ? `, ${warns} warning(s)` : ""}`)
  if (fails) process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
