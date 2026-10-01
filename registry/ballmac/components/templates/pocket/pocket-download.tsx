// Ballmac UI: Pocket download page. https://ui.ballmac.com/templates/template-pocket
"use client"

import * as React from "react"
import { Check, Smartphone } from "lucide-react"

import { PocketApp, PocketShell, StoreButtons, pocketDisplayClass, type PocketHrefs } from "@/components/ballmac/templates/pocket/pocket-theme"
import { cn } from "@/lib/utils"

/** A decorative QR-style code: three finder squares and a fixed pseudo-random fill, so server and client agree. */
function QrArt({ className }: { className?: string }) {
  const n = 21
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
  const cells: React.ReactNode[] = []
  let seed = 7
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      if (finder(x, y)) continue
      if ((seed >> 8) % 100 < 46) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    }
  const eye = (x: number, y: number) => (
    <g key={`${x}${y}`}><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" className="fill-card" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>
  )
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} role="img" aria-label="QR code that opens the download page on your phone" className={cn("bg-card fill-[var(--pocket-ink)] dark:fill-foreground rounded-2xl p-1", className)}>
      {cells}{eye(0, 0)}{eye(n - 7, 0)}{eye(0, n - 7)}
    </svg>
  )
}

type PocketDownloadProps = React.ComponentProps<"div"> & { hrefs?: Partial<PocketHrefs> }

/** The download page: store buttons, a QR code, and a “text me the link” form that validates and confirms. */
function PocketDownload({ hrefs, ...props }: PocketDownloadProps) {
  const link = { download: "/pocket/download", ...hrefs }
  const [value, setValue] = React.useState("")
  const [device, setDevice] = React.useState<"iphone" | "android">("iphone")
  const [error, setError] = React.useState("")
  const [sent, setSent] = React.useState<string | null>(null)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = value.trim()
    const ok = /^\S+@\S+\.\S+$/.test(v) || v.replace(/\D/g, "").length >= 10
    if (!ok) return setError("Enter a mobile number or an email address.")
    setError("")
    setSent(v)
  }
  return (
    <PocketShell page="download" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 className={cn("text-[clamp(3rem,9vw,7rem)] leading-[0.9] text-balance", pocketDisplayClass)}>Get Pocket in your pocket.</h1>
            <p className="text-muted-foreground mt-5 max-w-lg text-xl font-medium text-pretty">Free on iPhone and Android. Open an account in about four minutes, with a photo ID and your phone.</p>
            <StoreButtons href={link.download} className="mt-8" />

            <section aria-labelledby="pd-text" className="bg-card mt-10 rounded-[2rem] border p-6 sm:p-8">
              <h2 id="pd-text" className={cn("flex items-center gap-2 text-2xl", pocketDisplayClass)}><Smartphone className="size-6" aria-hidden="true" />On your computer? Text yourself the link.</h2>
              {sent ? (
                <p role="status" className="bg-chart-1 mt-5 flex items-center gap-2 rounded-2xl p-4 font-extrabold text-[var(--pocket-on-lime)]"><Check className="size-5 shrink-0" aria-hidden="true" />Sent to {sent}. Open it on your {device === "iphone" ? "iPhone" : "Android"}.</p>
              ) : (
                <form onSubmit={submit} noValidate className="mt-5 grid gap-4">
                  <fieldset><legend className="mb-2 text-sm font-extrabold">Your phone</legend>
                    <div className="flex gap-2">{([["iphone", "iPhone"], ["android", "Android"]] as const).map(([v, l]) => <label key={v} className={cn("focus-within:ring-ring/50 cursor-pointer rounded-full border-2 px-5 py-2.5 text-sm font-extrabold transition-colors focus-within:ring-[3px] motion-reduce:transition-none", device === v ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40")}><input type="radio" name="device" value={v} checked={device === v} onChange={() => setDevice(v)} className="sr-only" />{l}</label>)}</div>
                  </fieldset>
                  <div className="grid gap-2"><label htmlFor="pd-contact" className="text-sm font-extrabold">Mobile number or email</label>
                    <div className="flex flex-col gap-2 sm:flex-row"><input id="pd-contact" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "pd-err" : undefined} placeholder="(555) 010-2030" className="bg-background focus-visible:ring-ring/50 aria-invalid:border-destructive h-14 min-w-0 flex-1 rounded-full border-2 px-6 text-lg font-bold outline-none focus-visible:ring-[3px]" /><button type="submit" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 h-14 rounded-full px-8 text-lg font-extrabold outline-none focus-visible:ring-[3px]">Text me the link</button></div>
                    {error && <p id="pd-err" role="alert" className="text-destructive text-sm font-bold">{error}</p>}
                  </div>
                  <p className="text-muted-foreground text-xs font-medium">We send one message and do not keep your number.</p>
                </form>
              )}
            </section>
          </div>

          <div className="relative mx-auto grid w-full max-w-sm justify-items-center gap-6">
            <PocketApp defaultTab="save" className="w-[min(100%,290px)]" />
            <div className="bg-chart-1 relative z-10 -mt-20 flex items-center gap-4 self-end rounded-3xl p-4 text-[var(--pocket-on-lime)] shadow-xl sm:-mr-8"><QrArt className="size-24" /><p className="max-w-[9rem] text-sm font-extrabold">Point your camera here to download</p></div>
          </div>
        </div>

        <section aria-labelledby="pd-need" className="mt-24 grid gap-4 md:grid-cols-3">
          <h2 id="pd-need" className="sr-only">What you need</h2>
          {[["A phone", "iOS 16 or later, or Android 10 or later. Face or fingerprint unlock turned on."], ["A photo ID", "A passport or driver’s licence. We check it in the app, usually in under a minute."], ["Four minutes", "That is the median. You can fund the account straight away from a bank account or card."]].map(([t, b]) => <div key={t} className="bg-secondary rounded-3xl p-7"><h3 className={cn("text-2xl", pocketDisplayClass)}>{t}</h3><p className="text-muted-foreground mt-2 font-medium text-pretty">{b}</p></div>)}
        </section>
      </main>
    </PocketShell>
  )
}

export { PocketDownload, QrArt, type PocketDownloadProps }
