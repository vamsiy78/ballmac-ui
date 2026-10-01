// Ballmac UI: Muse settings page. https://ui.ballmac.com/templates/template-muse
"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import { Slider } from "@/components/ballmac/slider"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Switch } from "@/components/ballmac/switch"
import { memories as seedMemories, models } from "@/components/ballmac/templates/muse/muse-data"
import { MuseShell, museButton, type MuseHrefs } from "@/components/ballmac/templates/muse/muse-theme"
import { cn } from "@/lib/utils"

type Font = "serif" | "sans"

type MuseSettingsProps = React.ComponentProps<"div"> & { hrefs?: Partial<MuseHrefs> }

function Card({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="bg-card rounded-3xl border p-6 sm:p-7">
      <h2 id={id} className="text-lg font-medium">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm text-pretty">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

/** The Muse settings page: reading preferences with a live preview, default model, memory you can edit, and data controls with a type-to-confirm delete. */
function MuseSettings({ hrefs, ...props }: MuseSettingsProps) {
  const [font, setFont] = React.useState<Font>("serif")
  const [size, setSize] = React.useState(17)
  const [model, setModel] = React.useState("muse-5")
  const [memoryOn, setMemoryOn] = React.useState(true)
  const [memories, setMemories] = React.useState(seedMemories)
  const [confirm, setConfirm] = React.useState("")
  const [deleted, setDeleted] = React.useState(false)

  return (
    <MuseShell page="settings" title="Settings" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-2xl space-y-5 px-4 pb-14 sm:px-6">
        <Card id="ms-reading" title="Reading" description="Choose how replies look. The preview updates as you change it.">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p id="ms-font-label" className="text-sm font-medium">Reply font</p>
            <SegmentedControl aria-labelledby="ms-font-label" value={font} onValueChange={(v) => setFont(v as Font)}>
              <SegmentedControlItem value="serif">Serif</SegmentedControlItem>
              <SegmentedControlItem value="sans">Sans</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm"><label id="ms-size-label" className="font-medium">Text size</label><output className="text-muted-foreground tabular-nums">{size}px</output></div>
            <Slider className="mt-3" aria-labelledby="ms-size-label" min={15} max={21} step={1} value={[size]} onValueChange={(v) => setSize(v[0] ?? size)} formatValue={(v) => `${v} pixels`} />
          </div>
          <p className={cn("bg-surface mt-6 rounded-2xl border p-5 text-pretty", font === "serif" ? "[font-family:var(--muse-serif),ui-serif,Georgia,serif]" : "")} style={{ fontSize: size, lineHeight: 1.75 }}>
            An index fund is a basket that owns a small slice of hundreds of companies, so you are not betting on any one of them.
          </p>
        </Card>

        <Card id="ms-model" title="Default model" description="New chats start with this model. You can change it in any chat.">
          <div role="radiogroup" aria-label="Default model" className="grid gap-2">
            {models.map((m) => (
              <label key={m.id} className={cn("has-[:focus-visible]:ring-ring/50 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-[3px]", model === m.id ? "border-foreground/40 bg-accent/60" : "hover:bg-accent/40")}>
                <input type="radio" name="default-model" value={m.id} checked={model === m.id} onChange={() => setModel(m.id)} className="accent-chart-1 mt-1 size-4" />
                <span><span className="block text-sm font-medium">{m.name}</span><span className="text-muted-foreground block text-sm text-pretty">{m.description}</span></span>
              </label>
            ))}
          </div>
        </Card>

        <Card id="ms-memory" title="Memory" description="Muse remembers useful things between chats. You decide what stays.">
          <div className="flex items-center justify-between gap-4">
            <p id="ms-mem-label" className="text-sm font-medium">Remember things about me</p>
            <Switch aria-labelledby="ms-mem-label" checked={memoryOn} onCheckedChange={setMemoryOn} />
          </div>
          {memoryOn && (
            <>
              <ul className="mt-4 divide-y rounded-2xl border">
                {memories.map((m) => (
                  <li key={m} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span className="min-w-0 flex-1 text-pretty">{m}</span>
                    <button type="button" aria-label={`Forget: ${m}`} onClick={() => setMemories((all) => all.filter((x) => x !== m))} className="text-muted-foreground hover:text-destructive hover:bg-accent focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]"><Trash2 className="size-4" aria-hidden="true" /></button>
                  </li>
                ))}
                {memories.length === 0 && <li className="text-muted-foreground px-4 py-8 text-center text-sm">Muse hasn’t remembered anything yet.</li>}
              </ul>
              <p className="text-muted-foreground mt-2 text-xs" role="status">{memories.length} {memories.length === 1 ? "memory" : "memories"} saved</p>
            </>
          )}
        </Card>

        <Card id="ms-data" title="Your data" description="Export everything, or delete your account and all chats.">
          <button type="button" className={museButton.outline}>Export my data</button>
          <div className="border-destructive/40 mt-6 rounded-2xl border p-5">
            <h3 className="text-sm font-medium">Delete account</h3>
            <p className="text-muted-foreground mt-1 text-sm text-pretty">This removes all chats, projects and your library. It can’t be undone.</p>
            {deleted ? (
              <p role="status" className="text-destructive mt-4 text-sm font-medium">Your account is scheduled for deletion in 7 days.</p>
            ) : (
              <>
                <label htmlFor="ms-confirm" className="mt-4 block text-sm">Type <span className="font-mono font-semibold">delete my account</span> to confirm</label>
                <input id="ms-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-background focus-visible:ring-ring/50 mt-2 h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-[3px]" />
                <button type="button" disabled={confirm !== "delete my account"} onClick={() => setDeleted(true)} className={cn(museButton.danger, "mt-3")}>Delete account</button>
              </>
            )}
          </div>
        </Card>
      </main>
    </MuseShell>
  )
}

export { MuseSettings, type MuseSettingsProps }
