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
    const products = Boolean(env.DODO_PRODUCT_IDS?.trim())
    const apiKey = Boolean(env.DODO_API_KEY?.trim())
    if (products && !apiKey) add(production ? "fail" : "warn", "DODO_PRODUCT_IDS is set but DODO_API_KEY is not. Dodo's validate answer does not name the product, so every licence key would be refused. Add a Dodo API key (Developer → API Keys) of the same mode")
    else if (!products) add("warn", "DODO_PRODUCT_IDS and DODO_API_KEY are not set, so any licence key from this Dodo business unlocks Pro. That is only safe if Pro is the only licensed product in it")
    else add("ok", "Dodo product check configured (DODO_PRODUCT_IDS and DODO_API_KEY)")
    if (apiKey && !products) add("warn", "DODO_API_KEY is set without DODO_PRODUCT_IDS, so it is not used. Set DODO_PRODUCT_IDS to the Pro product id")
  }
  need(!env.BALLMAC_PRO_TEST_KEYS || !production, "BALLMAC_PRO_TEST_KEYS empty in production (ignored by the server, but remove it)", "warn")
  const checkout = env.NEXT_PUBLIC_PRO_CHECKOUT_URL
  need(checkout?.startsWith("https://"), "NEXT_PUBLIC_PRO_CHECKOUT_URL is an https URL")
  need(!checkout || env.NEXT_PUBLIC_PRO_PRICE, "NEXT_PUBLIC_PRO_PRICE set (confirmed by the owner)")
  const team = env.NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL
  need(!team || (team.startsWith("https://") && env.NEXT_PUBLIC_PRO_TEAM_PRICE), "Team checkout URL and price set together", "warn")
  need(env.NEXT_PUBLIC_PRO_LICENSE_URL?.startsWith("https://"), "NEXT_PUBLIC_PRO_LICENSE_URL points at the Pro licence terms")
  need((env.PRO_SESSION_SECRET ?? "").length >= 32, "PRO_SESSION_SECRET set, 32 characters or more (without it buyers cannot log in on /pro; generate one with: openssl rand -base64 32)")
  need(!env.NEXT_PUBLIC_PRO_PORTAL_URL || env.NEXT_PUBLIC_PRO_PORTAL_URL.startsWith("https://"), "NEXT_PUBLIC_PRO_PORTAL_URL is an https URL (the page where buyers find their key again)", "warn")
  need(env.RESEND_API_KEY && env.RESEND_FROM && env.CONTACT_TO_EMAIL, "Support form configured (RESEND_API_KEY, RESEND_FROM, CONTACT_TO_EMAIL); without them /support says it is not set up and points to the email address", "warn")
  // The founding offer: a deadline needs a regular price and a regular checkout to switch to, or Pro would sell nothing after it.
  const ends = env.NEXT_PUBLIC_PRO_FOUNDING_ENDS?.trim()
  if (ends || env.NEXT_PUBLIC_PRO_FOUNDING_LIMIT) {
    need(!ends || Number.isFinite(Date.parse(ends)), "NEXT_PUBLIC_PRO_FOUNDING_ENDS is a real date with a zone, for example 2026-10-21T18:29:00Z (11:59 pm IST)")
    need(!ends || Date.parse(ends) > Date.now(), "NEXT_PUBLIC_PRO_FOUNDING_ENDS is in the future", "warn")
    need(!ends || (Number(env.NEXT_PUBLIC_PRO_LIST_PRICE) > Number(env.NEXT_PUBLIC_PRO_PRICE) && env.NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL?.startsWith("https://")), "A founding deadline needs NEXT_PUBLIC_PRO_LIST_PRICE (higher than the founding price) and NEXT_PUBLIC_PRO_STANDARD_CHECKOUT_URL (the regular product's link); without them nothing is for sale after the deadline")
    need(env.DODO_FOUNDING_PRODUCT_ID?.trim() && env.DODO_API_KEY?.trim(), "DODO_FOUNDING_PRODUCT_ID and DODO_API_KEY set: they end the offer at the licence cap and open the Founders desk; without them the offer ends only at the deadline", "warn")
    need(!env.DODO_FOUNDING_PRODUCT_ID?.trim() || (env.DODO_PRODUCT_IDS ?? "").split(",").map((x) => x.trim()).includes(env.DODO_FOUNDING_PRODUCT_ID.trim()), "DODO_FOUNDING_PRODUCT_ID is also listed in DODO_PRODUCT_IDS, or founding buyers' keys would be refused")
    need(env.RESEND_AUDIENCE_ID && env.RESEND_API_KEY && env.RESEND_FROM, "Reminder emails configured (RESEND_AUDIENCE_ID, RESEND_API_KEY, RESEND_FROM); without them the reminder form says it is not set up", "warn")
  }
  if (env.CI) need(env.PRO_REPO_TOKEN, "PRO_REPO_TOKEN available to CI")
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
    // Dodo's public validate answer is only `valid`, so the product check lists the keys issued for the Pro product with an API key.
    const provider = (env.BALLMAC_LICENSE_PROVIDER ?? "").toLowerCase()
    if (provider === "dodopayments" || provider === "dodo") {
      const base = env.DODO_API_URL ?? (env.DODO_MODE === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com")
      const products = (env.DODO_PRODUCT_IDS ?? "").split(",").map((x) => x.trim()).filter(Boolean)
      if (products.length && env.DODO_API_KEY?.trim()) {
        let total = 0
        for (const product of products) {
          const res = await fetch(`${base}/license_keys?${new URLSearchParams({ product_id: product, status: "active", page_size: "100" })}`, { headers: { authorization: `Bearer ${env.DODO_API_KEY}` } })
          if (!res.ok) {
            out.push({ level: "fail", msg: `Dodo licence key list for ${product} returned ${res.status}. Check that DODO_API_KEY is a ${env.DODO_MODE === "test" ? "test" : "live"} mode key and the product id is right` })
            continue
          }
          const body = (await res.json().catch(() => ({}))) as { items?: unknown[] }
          total += body.items?.length ?? 0
        }
        out.push({ level: "ok", msg: `Dodo licence key list reachable (${total} active key(s) on page one for the Pro product)` })
      } else if (key) {
        out.push({ level: "warn", msg: "Dodo's validate answer is only `valid`, so without DODO_PRODUCT_IDS and DODO_API_KEY it cannot tell which product a key is for" })
      }
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
