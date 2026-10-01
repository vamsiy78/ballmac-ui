// Ballmac UI: Download 1. https://ui.ballmac.com/blocks/download-1
"use client"

import * as React from "react"
import { ArrowDownToLine, Bug, Check, Sparkles, Wand2 } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { CopyButton } from "@/components/ballmac/copy-button"
import { AppIcon } from "@/components/ballmac/mac-icons"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { cn } from "@/lib/utils"

type Download1Arch = "arm64" | "x64"
type Download1Kind = "new" | "improved" | "fixed"

type Download1Release = {
  version: string
  /** Release date as an ISO date, shown in UTC. */
  date: string
  changes: { type: Download1Kind; text: string }[]
}

type Download1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** App name. */
  app?: string
  /** One sentence under the name. */
  tagline?: string
  /** One letter or short text drawn on the icon. */
  glyph?: string
  /** Downloads per Mac type: the link, the file name and the size. */
  downloads?: Record<Download1Arch, { href: string; file: string; size: string; sha256?: string }>
  /** Requirements shown as chips. */
  requirements?: string[]
  /** Command for Homebrew users. Pass null to hide it. */
  brew?: string | null
  /** Install steps. Pass an empty array to hide them. */
  steps?: string[]
  /** Releases, newest first. The first one is the current version. */
  releases?: Download1Release[]
  /** Locale for dates. Fixed by default so server and browser match. */
  locale?: string
}

const kinds: Record<Download1Kind, { label: string; icon: typeof Sparkles; chip: string }> = {
  new: { label: "New", icon: Sparkles, chip: "bg-chart-2/15" },
  improved: { label: "Improved", icon: Wand2, chip: "bg-chart-1/15" },
  fixed: { label: "Fixed", icon: Bug, chip: "bg-chart-3/20" },
}

const defaultReleases: Download1Release[] = [
  {
    version: "2.4.0", date: "2026-09-29",
    changes: [
      { type: "new", text: "Approve or reject invoices from the menu bar" },
      { type: "new", text: "Daily digest notification with the three items that need you" },
      { type: "improved", text: "Opens large ledgers about twice as fast" },
      { type: "fixed", text: "Exports no longer drop the last row" },
    ],
  },
  {
    version: "2.3.2", date: "2026-09-18",
    changes: [
      { type: "fixed", text: "Dark mode charts were unreadable on some displays" },
      { type: "improved", text: "Clearer message when a bank connection needs refreshing" },
    ],
  },
  {
    version: "2.3.0", date: "2026-09-04",
    changes: [
      { type: "new", text: "SAML single sign-on for teams" },
      { type: "improved", text: "The audit log records which identity provider was used" },
    ],
  },
]

const defaultDownloads: NonNullable<Download1Props["downloads"]> = {
  arm64: { href: "#", file: "Ledger-2.4.0-arm64.dmg", size: "58 MB", sha256: "9f2c71a0d4b8e53c1a6f07b2d9e8c4a15b3f6e0d7c2a9b84e1f5d3a60c7b2e91" },
  x64: { href: "#", file: "Ledger-2.4.0-x64.dmg", size: "64 MB", sha256: "4b7e0a93c2d1f685e0a7b3c9d2f1840e6a5b97c3d0e2f4186a9b5c7d3e1f0a28" },
}

function Download1({
  app = "Ledger",
  tagline = "Invoices, approvals and reports, right in your menu bar.",
  glyph,
  downloads = defaultDownloads,
  requirements = ["macOS 13 Ventura or later", "Apple silicon or Intel", "Signed and notarized"],
  brew = "brew install --cask ledger",
  steps = ["Open the downloaded disk image.", "Drag Ledger into your Applications folder.", "Open Ledger and sign in with your account."],
  releases = defaultReleases,
  locale = "en-US",
  className,
  ...props
}: Download1Props) {
  const [arch, setArch] = React.useState<Download1Arch>("arm64")
  const [version, setVersion] = React.useState(releases[0]?.version ?? "")
  const [started, setStarted] = React.useState(false)
  const current = releases[0]
  const shown = releases.find((r) => r.version === version) ?? current
  const dl = downloads[arch]
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" })
  const fmt = (iso: string) => date.format(new Date(`${iso}T00:00:00Z`))

  return (
    <section data-slot="download-1" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="min-w-0">
          <div className="flex items-center gap-5">
            <AppIcon size={88} tone="blue" className="text-3xl font-bold">{glyph ?? app[0]}</AppIcon>
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{app} for Mac</h2>
              {current && <p className="text-muted-foreground mt-1 text-sm">Version {current.version} · {fmt(current.date)}</p>}
            </div>
          </div>
          <p className="text-muted-foreground mt-6 max-w-md text-lg text-pretty">{tagline}</p>

          <div className="bg-card mt-8 rounded-3xl border p-5 sm:p-6">
            <p id="download-1-arch" className="mb-2 text-sm font-medium">Which Mac do you have?</p>
            <SegmentedControl aria-labelledby="download-1-arch" value={arch} onValueChange={(v) => { setArch(v as Download1Arch); setStarted(false) }} fullWidth>
              <SegmentedControlItem value="arm64">Apple silicon</SegmentedControlItem>
              <SegmentedControlItem value="x64">Intel</SegmentedControlItem>
            </SegmentedControl>
            <p className="text-muted-foreground mt-2 text-xs">Not sure? Choose Apple menu, About This Mac. Chips named M1 or later are Apple silicon.</p>
            <a href={dl.href} onClick={() => setStarted(true)} className={buttonVariants({ size: "lg", shape: "pill", className: "mt-5 w-full" })}>
              <ArrowDownToLine /> Download {app} <span className="opacity-70">· {dl.size}</span>
            </a>
            <p role="status" className="text-muted-foreground mt-3 min-h-5 text-center text-xs">
              {started ? `Your download should start in a moment (${dl.file}).` : dl.file}
            </p>
            {requirements.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                {requirements.map((r) => (
                  <li key={r} className="bg-muted/60 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"><Check className="size-3" aria-hidden="true" />{r}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {dl.sha256 && (
              <div className="flex items-center gap-3 rounded-2xl border px-4 py-2.5">
                <span className="text-muted-foreground shrink-0 text-xs font-medium">SHA-256</span>
                <code className="min-w-0 flex-1 truncate font-mono text-xs" title={dl.sha256}>{dl.sha256}</code>
                <CopyButton value={dl.sha256} ariaLabel="Copy SHA-256 checksum" variant="ghost" size="default" />
              </div>
            )}
            {brew && (
              <div className="flex items-center gap-3 rounded-2xl border px-4 py-2.5">
                <span className="text-muted-foreground shrink-0 text-xs font-medium">Homebrew</span>
                <code className="min-w-0 flex-1 truncate font-mono text-xs">{brew}</code>
                <CopyButton value={brew} ariaLabel="Copy Homebrew command" variant="ghost" size="default" />
              </div>
            )}
          </div>

          {steps.length > 0 && (
            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-sm">
                  <span aria-hidden="true" className="bg-foreground text-background flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {shown && (
          <div className="bg-card min-w-0 self-start rounded-3xl border p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight">Release notes</h3>
              {releases.length > 1 && (
                <SegmentedControl aria-label="Version" size="sm" value={shown.version} onValueChange={setVersion}>
                  {releases.map((r) => <SegmentedControlItem key={r.version} value={r.version}>{r.version}</SegmentedControlItem>)}
                </SegmentedControl>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{app} {shown.version} · {fmt(shown.date)}{shown === current ? " · latest" : ""}</p>
            <ul className="mt-6 space-y-3.5">
              {shown.changes.map((c) => {
                const k = kinds[c.type]
                return (
                  <li key={c.text} className="flex items-start gap-3 text-[15px] leading-6">
                    <span className={cn("mt-0.5 inline-flex h-6 w-[5.5rem] shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-medium", k.chip)}>
                      <k.icon className="size-3.5" aria-hidden="true" />{k.label}
                    </span>
                    <span className="text-pretty">{c.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export { Download1, type Download1Props, type Download1Release, type Download1Arch }
