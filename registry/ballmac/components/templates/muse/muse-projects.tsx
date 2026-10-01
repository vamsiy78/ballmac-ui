// Ballmac UI: Muse projects page. https://ui.ballmac.com/templates/template-muse
"use client"

import * as React from "react"
import { Check, FileText, MessageSquare, Plus, Upload } from "lucide-react"

import { projects as seed, type MuseProject } from "@/components/ballmac/templates/muse/muse-data"
import { MuseShell, museButton, type MuseHrefs } from "@/components/ballmac/templates/muse/muse-theme"
import { cn } from "@/lib/utils"

const tones = ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/25", "bg-chart-4/20", "bg-chart-5/20"]

type MuseProjectsProps = React.ComponentProps<"div"> & { hrefs?: Partial<MuseHrefs> }

/** The Muse projects page: a list on the left, and the selected project with editable instructions, files and chats on the right. */
function MuseProjects({ hrefs, ...props }: MuseProjectsProps) {
  const [list, setList] = React.useState<MuseProject[]>(seed)
  const [selectedId, setSelectedId] = React.useState(seed[0].id)
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})
  const [savedId, setSavedId] = React.useState<string | null>(null)
  const sel = list.find((p) => p.id === selectedId) ?? list[0]
  const draft = drafts[sel.id] ?? sel.instructions
  const dirty = draft !== sel.instructions

  function save() {
    setList((all) => all.map((p) => (p.id === sel.id ? { ...p, instructions: draft } : p)))
    setSavedId(sel.id)
  }
  function addFile() {
    setList((all) => all.map((p) => (p.id === sel.id ? { ...p, files: [...p.files, { name: `Upload ${p.files.length + 1}.pdf`, size: "1.2 MB" }] } : p)))
  }
  function create() {
    const id = `new-${list.length}`
    setList((all) => [...all, { id, name: `Untitled project ${all.length - seed.length + 1}`, description: "A fresh project. Add instructions and files.", tone: (all.length % 4) + 1, chats: 0, files: [], instructions: "" }])
    setSelectedId(id)
  }

  return (
    <MuseShell page="projects" title="Projects" hrefs={hrefs} actions={<button type="button" className={museButton.primary} onClick={create}><Plus aria-hidden="true" /> New project</button>} {...props}>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <section aria-label="All projects">
          <ul className="space-y-2">
            {list.map((p) => {
              const on = p.id === sel.id
              return (
                <li key={p.id}>
                  <button type="button" aria-pressed={on} onClick={() => setSelectedId(p.id)} className={cn("focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-2xl border p-3 text-left outline-none transition-colors focus-visible:ring-[3px]", on ? "bg-card border-foreground/25 shadow-sm" : "hover:bg-accent/60 border-transparent")}>
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold", tones[(p.tone - 1) % tones.length])} aria-hidden="true">{p.name[0]}</span>
                    <span className="min-w-0"><span className="block truncate text-sm font-medium">{p.name}</span><span className="text-muted-foreground block truncate text-xs">{p.chats} chats · {p.files.length} {p.files.length === 1 ? "file" : "files"}</span></span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="mp-title" className="min-w-0">
          <div className="bg-card rounded-3xl border p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold", tones[(sel.tone - 1) % tones.length])} aria-hidden="true">{sel.name[0]}</span>
              <div className="min-w-0"><h2 id="mp-title" className="text-2xl font-medium tracking-[-0.02em] [font-family:var(--muse-serif),ui-serif,Georgia,serif]">{sel.name}</h2><p className="text-muted-foreground mt-1 text-pretty">{sel.description}</p></div>
            </div>

            <div className="mt-8">
              <label htmlFor="mp-inst" className="text-sm font-medium">Instructions</label>
              <p className="text-muted-foreground mt-0.5 text-sm">Muse follows these in every chat in this project.</p>
              <textarea id="mp-inst" rows={4} value={draft} onChange={(e) => { setDrafts((d) => ({ ...d, [sel.id]: e.target.value })); setSavedId(null) }} placeholder="Tell Muse how to work on this project" className="bg-background focus-visible:ring-ring/50 placeholder:text-muted-foreground mt-3 w-full resize-y rounded-2xl border p-4 text-[15px] leading-relaxed outline-none focus-visible:ring-[3px]" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm" role="status">{savedId === sel.id ? <><Check className="text-chart-2 size-4" aria-hidden="true" />Saved</> : dirty ? "Unsaved changes" : ""}</p>
                <button type="button" onClick={save} disabled={!dirty} className={museButton.primary}>Save instructions</button>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Files <span className="text-muted-foreground font-normal">({sel.files.length})</span></h3>
                <button type="button" onClick={addFile} className={museButton.outline}><Upload aria-hidden="true" /> Add file</button>
              </div>
              {sel.files.length === 0 ? (
                <p className="text-muted-foreground mt-3 rounded-2xl border border-dashed p-6 text-center text-sm">No files yet. Add documents Muse should always have on hand.</p>
              ) : (
                <ul className="mt-3 divide-y rounded-2xl border">
                  {sel.files.map((f) => <li key={f.name} className="flex items-center gap-3 px-4 py-3 text-sm"><FileText className="text-muted-foreground size-4" aria-hidden="true" /><span className="min-w-0 flex-1 truncate font-medium">{f.name}</span><span className="text-muted-foreground text-xs">{f.size}</span></li>)}
                </ul>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium">Chats in this project</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {["Weekly update draft", "Planning notes", "Feedback summary"].slice(0, Math.min(3, Math.max(1, sel.chats))).map((c) => (
                  <li key={c}><a href={hrefs?.chat ?? "/muse"} className="hover:bg-accent focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-xl border p-3 text-sm outline-none focus-visible:ring-[3px]"><MessageSquare className="text-muted-foreground size-4" aria-hidden="true" />{c}</a></li>
                ))}
              </ul>
              {sel.chats === 0 && <p className="text-muted-foreground mt-2 text-sm">No chats yet. Start one from the sidebar.</p>}
            </div>
          </div>
        </section>
      </main>
    </MuseShell>
  )
}

export { MuseProjects, type MuseProjectsProps }
