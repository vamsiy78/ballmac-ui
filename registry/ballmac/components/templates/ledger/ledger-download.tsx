// Ballmac UI: Ledger download page. https://ui.ballmac.com/templates/template-ledger
import * as React from "react"
import { Apple, Cpu, HardDrive, ShieldCheck } from "lucide-react"

import { Download1 } from "@/components/ballmac/blocks/download-1/download-1"
import { LedgerHeading, LedgerShell, type LedgerHrefs } from "@/components/ballmac/templates/ledger/ledger-theme"

const specs = [
  { icon: Apple, title: "macOS 13 Ventura or later", text: "Runs on every Mac that supports it, including the 2018 MacBook Air." },
  { icon: Cpu, title: "Apple silicon and Intel", text: "A universal app, tuned for M-series chips and still quick on Intel." },
  { icon: HardDrive, title: "58 MB to download", text: "Under 150 MB installed. Your books are a single file you can back up." },
  { icon: ShieldCheck, title: "Signed and notarized", text: "Checked by Apple and by us. SHA-256 checksums are published with every release." },
]

type LedgerDownloadProps = React.ComponentProps<"div"> & { hrefs?: Partial<LedgerHrefs> }

/** Ledger download: the download block, the system requirements and a note on updates. */
function LedgerDownload({ hrefs, ...props }: LedgerDownloadProps) {
  return (
    <LedgerShell page="home" hrefs={hrefs} {...props}>
      <main>
        <div className="mx-auto max-w-6xl px-4 pt-16 text-center sm:px-6 sm:pt-20">
          <LedgerHeading as="h1" className="text-4xl sm:text-6xl">Download <em>Ledger</em>.</LedgerHeading>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-lg text-pretty">Free for 14 days. You only need a license if you keep using it.</p>
        </div>
        <Download1 app="Ledger" />
        <section aria-labelledby="ledger-specs" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <h2 id="ledger-specs" className="text-2xl font-semibold tracking-[-0.03em]">Before you download</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {specs.map((s) => (
              <li key={s.title} className="bg-card flex gap-4 rounded-2xl border p-5">
                <span className="bg-chart-1/12 text-chart-1 flex size-10 shrink-0 items-center justify-center rounded-xl"><s.icon className="size-5" aria-hidden="true" /></span>
                <div><h3 className="font-medium">{s.title}</h3><p className="text-muted-foreground mt-1 text-sm text-pretty">{s.text}</p></div>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-8 text-sm text-pretty">Ledger updates itself in the background and asks before restarting. Need an older version? <a href={hrefs?.changelog ?? "/ledger/changelog"} className="text-chart-1 underline underline-offset-4">Browse every release</a>.</p>
        </section>
      </main>
    </LedgerShell>
  )
}

export { LedgerDownload, type LedgerDownloadProps }
