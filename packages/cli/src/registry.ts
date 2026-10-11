import type { Tier } from "./lock.js"
import { CliError } from "./util.js"

export type ChangelogEntry = { version: string; date: string; note: string; breaking?: boolean }
export type ManifestItem = {
  title: string
  type: string
  version: string
  updated: string
  tier: Tier
  /** Install targets such as "@components/ballmac/button.tsx". */
  files: string[]
  /** Other Ballmac items this one installs with it. */
  requires: string[]
  tests: boolean
  changelog: ChangelogEntry[]
}
export type Manifest = { schema: 1; registry: string; items: Record<string, ManifestItem> }
export type TestItem = { schema: 1; name: string; version: string; file: string; content: string; requires: string[]; devDependencies: string[] }
export type SetupItem = { schema: 1; file: string; content: string; devDependencies: string[] }

export const DEFAULT_REGISTRY = "https://ui.ballmac.com"

export class Registry {
  readonly base: string
  readonly licenseKey: string | undefined
  private cache = new Map<string, Promise<unknown>>()

  constructor(base: string = DEFAULT_REGISTRY, licenseKey?: string, private fetchImpl: typeof fetch = fetch) {
    this.base = base.replace(/\/+$/, "")
    this.licenseKey = licenseKey || undefined
  }

  private get<T>(path: string, pro: boolean): Promise<T> {
    const url = `${this.base}${path}`
    const hit = this.cache.get(url)
    if (hit) return hit as Promise<T>
    const p = (async () => {
      if (pro && !this.licenseKey) throw new CliError("Ballmac UI Pro items need a licence key. Set BALLMAC_LICENSE_KEY (environment or .env.local).")
      let res: Response
      try {
        res = await this.fetchImpl(url, { headers: { accept: "application/json", ...(pro ? { authorization: `Bearer ${this.licenseKey}` } : {}) }, signal: AbortSignal.timeout(30_000) })
      } catch (e) {
        throw new CliError(`Could not reach ${this.base}: ${(e as Error).message}`)
      }
      if (res.status === 401 || res.status === 403) throw new CliError("The Ballmac UI licence key was not accepted. Check BALLMAC_LICENSE_KEY.")
      if (res.status === 429) throw new CliError("Too many requests. Try again in a few minutes.")
      if (!res.ok) throw new CliError(`${url} answered ${res.status}`)
      return (await res.json()) as T
    })()
    this.cache.set(url, p)
    return p
  }

  manifest(tier: Tier) {
    return this.get<Manifest>(tier === "pro" ? "/r/pro/versions.json" : "/r/versions.json", tier === "pro")
  }

  /** Free items always; Pro items too when a licence key is set. */
  async catalogue(): Promise<Record<string, ManifestItem>> {
    const free = await this.manifest("free")
    const pro = this.licenseKey ? await this.manifest("pro").catch(() => null) : null
    return { ...free.items, ...(pro?.items ?? {}) }
  }

  test(name: string) {
    return this.get<TestItem>(`/r/tests/${name}.json`, false)
  }

  testSetup() {
    return this.get<SetupItem>("/r/tests/_setup.json", false)
  }

  /** The address the shadcn CLI should add. Pro items go through the licensed namespace. */
  address(name: string, tier: Tier) {
    return tier === "pro" ? `@ballmac-pro/${name}` : `${this.base}/r/${name}.json`
  }
}
