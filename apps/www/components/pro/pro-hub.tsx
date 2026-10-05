"use client"

import { Archive, ArrowUpRight, Check, Download, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"
import * as React from "react"

import { buttonVariants } from "@/components/ballmac/button"
import { KeyChip } from "@/components/pro/key-chip"
import { ensureSession, login, useProFlag, useProSession } from "@/components/pro/session"
import { SetupTabs } from "@/components/pro/setup-tabs"
import { UnlockCard } from "@/components/pro/unlock-card"
import Link from "@/components/site/link"
import { cameFromCheckout, keysFromReturn } from "@/lib/pro-checkout"
import type { Download as DownloadItem } from "@/lib/pro-downloads"
import { cn } from "@/lib/utils"

export type HubStat = { value: string; label: string }
type Props = {
  stats: HubStat[]
  downloads: { starters: DownloadItem[]; kits: DownloadItem[] }
  sampleItem: string
  portalUrl?: string
  licenseUrl?: string
  /** The public catalogue of Pro items, rendered on the server. */
  children: React.ReactNode
}

const rise = "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-both"

/**
 * What happens when a buyer comes back from checkout. Dodo appends `license_key` to the return address, so the buyer is logged in
 * at once, and the key is then removed from the address bar. Without a key (or if it is refused) the page says to paste it.
 */
function Welcome() {
  const params = useSearchParams()
  // The address is read once: it is rewritten below so the key does not stay in the address bar or the history.
  const [initial] = React.useState(() => params.toString())
  const search = React.useMemo(() => new URLSearchParams(initial), [initial])
  const keys = React.useMemo(() => keysFromReturn(search), [search])
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => {
    if (!keys.length) return
    let live = true
    void (async () => {
      let ok = false
      for (const key of keys) {
        if ((await login(key)).ok) {
          ok = true
          break
        }
      }
      window.history.replaceState(null, "", window.location.pathname)
      if (live && !ok) setFailed(true)
    })()
    return () => {
      live = false
    }
  }, [keys])
  if (!cameFromCheckout(search)) return null
  return (
    <p className="bg-card mx-auto mt-8 flex max-w-[1100px] items-start gap-3 rounded-xl border p-4 text-sm leading-6 shadow-xs" role="status">
      <span className="bg-foreground text-background mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
        <Check className="size-3" />
      </span>
      <span>
        <strong className="font-medium">Thank you, your payment went through.</strong>{" "}
        {keys.length && !failed
          ? "Opening your library…"
          : failed
            ? "We could not open it automatically. Paste the licence key from the email we sent you below."
            : "Your licence key is in the email from our payment partner (check spam if it is not there yet). Paste it below to open your library."}
      </span>
    </p>
  )
}

function Lock({ portalUrl, stats }: Pick<Props, "portalUrl" | "stats">) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_80%_at_70%_20%,black,transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 -z-10 size-[34rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--foreground)_9%,transparent),transparent)]" />
        <div className="px-4 sm:px-6">
          <React.Suspense fallback={null}>
            <Welcome />
          </React.Suspense>
        </div>
        <div className="mx-auto grid max-w-[1100px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:py-24">
          <div className={rise}>
            <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Ballmac UI Pro
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Welcome back.</h1>
            <p className="text-muted-foreground mt-5 max-w-lg text-lg leading-relaxed text-pretty">
              Paste your licence key to open your library: read and copy any Pro block, download the starter apps, and get your install commands with your key already in them.
            </p>
            <ul className="mt-8 space-y-3 text-[15px]">
              {["Nothing to sign up for: the key is the login", "Works the same with the shadcn CLI and your AI agent", "Updates are included while the product exists"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="bg-foreground/[0.07] flex size-5 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
                    <Check className="size-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-8 text-sm">
              No licence yet?{" "}
              <Link href="/pricing" className="text-foreground font-medium underline underline-offset-4">
                See what Pro includes
              </Link>
            </p>
          </div>
          <div className={cn(rise, "motion-safe:delay-100")}>
            <UnlockCard portalUrl={portalUrl} />
          </div>
        </div>
      </section>
      {stats.length > 0 && (
        <section aria-label="What is in Pro" className="border-b">
          <dl className="mx-auto grid max-w-[1100px] grid-cols-2 divide-x px-0 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col px-4 py-7 text-center sm:px-6">
                <dt className="text-muted-foreground order-2 text-sm">{s.label}</dt>
                <dd className="order-1 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  )
}

function Loading() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6" role="status" aria-label="Opening your library">
      <div className="bg-muted h-10 w-72 animate-pulse rounded-lg" />
      <div className="bg-muted mt-4 h-5 w-96 max-w-full animate-pulse rounded-md" />
      <div className="bg-muted/60 mt-10 h-72 animate-pulse rounded-2xl" />
    </div>
  )
}

function DownloadCard({ d, kit = false }: { d: DownloadItem; kit?: boolean }) {
  return (
    <div className="bg-card flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-[0_10px_30px_-14px_rgb(0_0_0/0.25)]">
      <div className="flex items-start justify-between gap-3">
        <span className="bg-muted flex size-10 items-center justify-center rounded-xl" aria-hidden="true">
          <Archive className="size-5" />
        </span>
        {d.version && <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 font-mono text-xs">v{d.version}</span>}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{d.title}</h3>
      {d.description && <p className="text-muted-foreground mt-1.5 flex-1 text-sm leading-6">{d.description}</p>}
      <div className="mt-6 flex flex-wrap gap-2">
        {d.files.map((f, i) => (
          <a
            key={f.href}
            href={f.href}
            download
            className={buttonVariants({ size: "sm", variant: i === 0 ? "default" : "outline" })}
            aria-label={`Download ${d.title}${kit ? "" : " starter"} as ${f.label}, ${f.size}`}
          >
            <Download className="size-3.5" aria-hidden="true" />
            {f.label}
            <span className="opacity-60">{f.size}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function Library({ licenseKey, downloads, sampleItem, licenseUrl, children }: Props & { licenseKey: string }) {
  const all = [...downloads.starters, ...downloads.kits]
  return (
    <>
      <section className="border-b">
        <div className={cn(rise, "mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:py-16")}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                <span className="relative flex size-2" aria-hidden="true">
                  <span className="bg-foreground/40 absolute inline-flex size-full rounded-full motion-safe:animate-ping" />
                  <span className="bg-foreground relative inline-flex size-2 rounded-full" />
                </span>
                Licence active
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">Your Pro library</h1>
              <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
                Everything here is yours to use in your projects{licenseUrl ? <>, under the <a href={licenseUrl} className="text-foreground underline underline-offset-4">Pro licence</a></> : ""}.
              </p>
            </div>
            <KeyChip licenseKey={licenseKey} />
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/blocks" className={buttonVariants({ size: "sm" })}>
              Browse Pro blocks <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
            <Link href="/docs/pro" className={buttonVariants({ size: "sm", variant: "outline" })}>
              Setup guide
            </Link>
            <Link href="/docs/mcp" className={buttonVariants({ size: "sm", variant: "outline" })}>
              MCP server
            </Link>
            <Link href="/support?topic=help" className={buttonVariants({ size: "sm", variant: "ghost" })}>
              Get help
            </Link>
          </div>
        </div>
      </section>

      <section className={cn(rise, "mx-auto max-w-[1100px] px-4 py-14 motion-safe:delay-75 sm:px-6")} aria-labelledby="install-h">
        <h2 id="install-h" className="text-2xl font-semibold tracking-tight">Install</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">Pick how you work. Your key is already filled in, and hidden on screen until you copy.</p>
        <div className="bg-card mt-7 rounded-2xl border p-4 sm:p-8">
          <SetupTabs licenseKey={licenseKey} sampleItem={sampleItem} />
        </div>
      </section>

      {all.length > 0 && (
        <section className={cn(rise, "mx-auto max-w-[1100px] px-4 pb-14 motion-safe:delay-100 sm:px-6")} aria-labelledby="dl-h">
          <h2 id="dl-h" className="text-2xl font-semibold tracking-tight">Downloads</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">Complete apps and design tokens. Unzip, install and they run.</p>
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {downloads.starters.map((d) => (
              <DownloadCard key={d.slug} d={d} />
            ))}
            {downloads.kits.map((d) => (
              <DownloadCard key={d.slug} d={d} kit />
            ))}
          </div>
        </section>
      )}
      {children}
    </>
  )
}

/** /pro: the login for people without a session, the library for people with one. */
export function ProHub(props: Props) {
  const flag = useProFlag()
  const session = useProSession()
  React.useEffect(() => {
    void ensureSession()
  }, [])
  if (session.status === "in" && session.key) return <Library {...props} licenseKey={session.key} />
  if (session.status === "unknown" && flag) return <Loading />
  return (
    <>
      <Lock portalUrl={props.portalUrl} stats={props.stats} />
      {props.children}
    </>
  )
}
