// Ballmac UI: Import 1. https://ui.ballmac.com/blocks/import-1
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, CircleAlert, CircleCheck, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Progress } from "@/components/ballmac/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Import1Field = {
  key: string
  label: string
  required?: boolean
  /** Return a short reason when a value is not acceptable, or null when it is. Empty values are handled by `required`. */
  validate?: (value: string) => string | null
  /** Other names a column might have, used when matching automatically. */
  aliases?: string[]
}

type Import1Row = Record<string, string>

type Import1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> &
  StateProps & {
    title?: string
    description?: string
    fields?: Import1Field[]
    /** CSV text used by the "Try a sample file" button. */
    sampleCsv?: string
    /** Called with the rows that passed. Return a promise; reject to show a message. Without it, progress is simulated for demos. */
    onImport?: (rows: Import1Row[], progress: (done: number) => void) => void | Promise<void>
    /** Start on this step with the sample file already read (0 to 3). */
    defaultStep?: 0 | 1 | 2 | 3
  }

const defaultFields: Import1Field[] = [
  { key: "name", label: "Name", required: true, aliases: ["full name", "contact", "customer"] },
  { key: "email", label: "Email", required: true, aliases: ["e-mail", "email address", "mail"], validate: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Not an email address") },
  { key: "company", label: "Company", aliases: ["organisation", "organization", "employer"] },
  { key: "phone", label: "Phone", aliases: ["mobile", "telephone", "tel"], validate: (v) => (v.replace(/\D/g, "").length >= 7 ? null : "Too short for a phone number") },
  { key: "plan", label: "Plan", aliases: ["tier", "subscription"] },
]

const sample = `Full Name,E-mail,Organisation,Mobile,Tier
Hannah Brooks,hannah@brooks.studio,Brooks Studio,+44 20 7946 0958,Team
Marcus Webb,marcus@webbagency.com,Webb Agency,+1 212 555 0148,Business
Elif Demir,elif@demir.co,Demir & Co,+90 212 555 0177,Team
Tom Alvarez,tom.alvarez@@ops,Alvarez Ops,+34 91 555 0123,Starter
,aisha@rahman.io,Rahman Labs,+44 20 7946 0000,Team
Jonas Keller,jonas@keller.dev,Keller Software,12,Business
Priya Nair,priya@nair.me,,+91 22 5550 0188,Starter
Lucas Moreau,lucas@moreau.fr,Moreau Marketing,+33 1 55 50 01 77,Team
Hannah Brooks,hannah@brooks.studio,Brooks Studio,+44 20 7946 0958,Team
Sofia Rossi,sofia@rossi.it,Rossi Design,+39 02 5550 0144,Business`

// A small CSV reader: quoted fields, doubled quotes, commas and line breaks inside quotes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') q = false
      else cell += c
    } else if (c === '"') q = true
    else if (c === ",") { row.push(cell); cell = "" }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(cell); cell = ""
      if (row.some((x) => x.trim())) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x.trim())) rows.push(row)
  return rows
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
function autoMatch(headers: string[], fields: Import1Field[]) {
  const used = new Set<number>()
  const out: Record<string, number | null> = {}
  for (const f of fields) {
    const names = [f.key, f.label, ...(f.aliases ?? [])].map(norm)
    const i = headers.findIndex((h, idx) => !used.has(idx) && names.includes(norm(h)))
    out[f.key] = i >= 0 ? i : null
    if (i >= 0) used.add(i)
  }
  return out
}

const stepNames = ["Upload", "Match columns", "Review", "Import"]

function Skel() {
  return (
    <div aria-hidden="true" className="bg-card rounded-3xl border p-8">
      <Skeleton className="h-6 w-60" />
      <Skeleton className="mt-8 h-48 rounded-2xl" />
    </div>
  )
}

/**
 * A data import in four steps: choose a CSV file, match its columns to your fields (found for you where the names are alike), review which rows
 * are ready and which have problems and why, then import with progress and a summary. Missing required values, bad emails or phones and duplicate
 * rows are all caught before anything is sent, and a failure keeps you on the review with the rows intact.
 */
function Import1({
  title = "Import contacts",
  description = "Bring in a spreadsheet saved as CSV. We will check it before anything is added.",
  fields = defaultFields,
  sampleCsv = sample,
  onImport,
  defaultStep = 0,
  state = "ready",
  onRetry,
  errorState,
  className,
  ...props
}: Import1Props) {
  const id = React.useId()
  const [step, setStep] = React.useState<number>(defaultStep)
  const [fileName, setFileName] = React.useState(defaultStep ? "contacts.csv" : "")
  const [table, setTable] = React.useState<string[][]>(() => (defaultStep ? parseCsv(sampleCsv) : []))
  const [map, setMap] = React.useState<Record<string, number | null>>(() => (defaultStep ? autoMatch(parseCsv(sampleCsv)[0] ?? [], fields) : {}))
  const [onlyProblems, setOnlyProblems] = React.useState(false)
  const [drag, setDrag] = React.useState(false)
  const [readError, setReadError] = React.useState<string>()
  const [done, setDone] = React.useState(0)
  const [phase, setPhase] = React.useState<"idle" | "running" | "done" | "error">("idle")
  const [message, setMessage] = React.useState<string>()
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const first = React.useRef(true)
  const input = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (first.current) first.current = false
    else headingRef.current?.focus()
  }, [step])

  const headers = table[0] ?? []
  const body = table.slice(1)
  const missing = fields.filter((f) => f.required && map[f.key] == null)

  const rows = React.useMemo(() => {
    const seen = new Map<string, number>()
    const emailKey = fields.find((f) => f.key === "email")?.key
    return body.map((r, i) => {
      const values: Import1Row = {}
      const issues: string[] = []
      for (const f of fields) {
        const c = map[f.key]
        const v = c == null ? "" : (r[c] ?? "").trim()
        values[f.key] = v
        if (!v && f.required) issues.push(`${f.label} is missing`)
        else if (v && f.validate) {
          const bad = f.validate(v)
          if (bad) issues.push(`${f.label}: ${bad}`)
        }
      }
      if (emailKey && values[emailKey]) {
        const k = values[emailKey]!.toLowerCase()
        if (seen.has(k)) issues.push(`Same email as row ${seen.get(k)! + 2}`)
        else seen.set(k, i)
      }
      return { n: i + 2, values, issues }
    })
  }, [body, fields, map])
  const good = rows.filter((r) => !r.issues.length)
  const bad = rows.length - good.length

  function read(text: string, name: string) {
    const t = parseCsv(text)
    if (t.length < 2) return setReadError("That file has no rows under the header. Check it is a CSV with a first row of column names.")
    setReadError(undefined)
    setTable(t)
    setFileName(name)
    setMap(autoMatch(t[0]!, fields))
    setStep(1)
  }
  async function file(f?: File | null) {
    if (!f) return
    if (!/\.csv$|text\/csv|text\/plain/i.test(f.name + f.type)) return setReadError("Choose a CSV file. In your spreadsheet, use Save as and pick CSV.")
    read(typeof f.text === "function" ? await f.text() : await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result ?? "")); r.readAsText(f) }), f.name)
  }

  async function run() {
    setPhase("running")
    setDone(0)
    setMessage(undefined)
    try {
      if (onImport) await onImport(good.map((r) => r.values), (n) => setDone(n))
      else {
        for (let i = 1; i <= 10; i++) {
          await new Promise((r) => setTimeout(r, 140))
          setDone(Math.round((good.length * i) / 10))
        }
      }
      setDone(good.length)
      setPhase("done")
    } catch (e) {
      setMessage(e instanceof Error ? e.message : undefined)
      setPhase("error")
    }
  }

  const reset = () => {
    setStep(0)
    setTable([])
    setFileName("")
    setPhase("idle")
    setDone(0)
  }

  const stepper = (
    <ol aria-label="Steps" className="mb-8 flex items-center gap-2">
      {stepNames.map((n, i) => (
        <li key={n} aria-current={i === step ? "step" : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums", i < step && "bg-foreground text-background border-foreground", i === step && "border-foreground")}>
            {i < step ? <Check aria-hidden="true" className="size-4" /> : i + 1}
          </span>
          <span className={cn("hidden text-sm sm:block", i === step ? "font-semibold" : "text-muted-foreground")}>
            {n}
            <span className="sr-only">{i < step ? ", done" : i === step ? ", current step" : ""}</span>
          </span>
          {i < stepNames.length - 1 ? <span aria-hidden="true" className={cn("h-px flex-1", i < step ? "bg-foreground" : "bg-border")} /> : null}
        </li>
      ))}
    </ol>
  )

  const head = (text: string, sub?: string) => (
    <>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">
        {text}
      </h2>
      {sub ? <p className="text-muted-foreground mt-1.5 text-pretty">{sub}</p> : null}
    </>
  )

  const content = (
    <div className="bg-card rounded-3xl border p-5 sm:p-8">
      {stepper}

      {step === 0 ? (
        <div>
          {head("Choose a file", "A CSV with a first row of column names. Up to 10,000 rows.")}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); void file(e.dataTransfer.files[0]) }}
            className={cn("mt-6 flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors motion-reduce:transition-none", drag ? "border-foreground bg-accent/50" : "hover:bg-accent/30")}
          >
            <span aria-hidden="true" className="bg-muted flex size-14 items-center justify-center rounded-full">
              <UploadCloud className="size-6" />
            </span>
            <p className="mt-4 font-medium">Drag a CSV file here</p>
            <p className="text-muted-foreground mt-1 text-sm">or</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2.5">
              <Button onClick={() => input.current?.click()}>Choose a file</Button>
              <Button variant="outline" onClick={() => read(sampleCsv, "contacts.csv")}>
                <FileSpreadsheet aria-hidden="true" />
                Try a sample file
              </Button>
            </div>
            <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="CSV file" tabIndex={-1} onChange={(e) => void file(e.target.files?.[0])} />
          </div>
          {readError ? (
            <p role="alert" className="text-destructive mt-4 flex items-start gap-2 text-sm">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {readError}
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          {head("Match your columns", `${fileName} has ${body.length} rows. We matched what we could; check each one.`)}
          <ul className="mt-6 divide-y rounded-2xl border">
            {fields.map((f) => {
              const c = map[f.key]
              const sampleVals = c == null ? [] : body.slice(0, 3).map((r) => r[c]).filter(Boolean)
              return (
                <li key={f.key} className="grid items-center gap-3 p-4 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1.2fr)]">
                  <p id={`${id}-${f.key}`} className="text-sm font-medium">
                    {f.label}
                    {f.required ? <span className="text-destructive" aria-hidden="true"> *</span> : null}
                    {f.required ? <span className="sr-only"> (required)</span> : null}
                  </p>
                  <Select value={c == null ? "none" : String(c)} onValueChange={(v) => setMap((m) => ({ ...m, [f.key]: v === "none" ? null : Number(v) }))}>
                    <SelectTrigger aria-labelledby={`${id}-${f.key}`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Do not import</SelectItem>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {h || `Column ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground truncate text-sm">{sampleVals.length ? sampleVals.join(" · ") : <span>{f.required ? "Choose a column to continue" : "Not imported"}</span>}</p>
                </li>
              )
            })}
          </ul>
          {missing.length ? (
            <p role="alert" className="text-destructive mt-4 text-sm">
              Match {missing.map((f) => f.label).join(" and ")} to continue.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          {head("Review before importing")}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{good.length}</p>
              <p className="text-muted-foreground text-sm">ready to import</p>
            </div>
            <div className={cn("rounded-2xl border p-4", bad && "border-destructive/40 bg-destructive/5")}>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{bad}</p>
              <p className="text-muted-foreground text-sm">with problems, skipped</p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{rows.length}</p>
              <p className="text-muted-foreground text-sm">rows in the file</p>
            </div>
          </div>
          {bad ? (
            <label className="mt-5 flex w-fit cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} className="accent-foreground size-4" />
              Show only the rows with problems
            </label>
          ) : null}
          <div role="region" tabIndex={0} aria-label="Rows from your file" className="focus-visible:ring-ring/50 mt-4 max-h-96 overflow-auto rounded-2xl border outline-none focus-visible:ring-[3px]">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">Rows from your file and whether each can be imported</caption>
              <thead className="bg-muted/60 sticky top-0 text-start">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Row</th>
                  <th scope="col" className="min-w-52 px-4 py-2.5 text-start font-medium">Result</th>
                  {fields.filter((f) => map[f.key] != null).map((f) => (
                    <th key={f.key} scope="col" className="px-4 py-2.5 text-start font-medium">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.filter((r) => !onlyProblems || r.issues.length).map((r) => (
                  <tr key={r.n} className={cn(r.issues.length && "bg-destructive/5")}>
                    <td className="text-muted-foreground px-4 py-2.5 tabular-nums">{r.n}</td>
                    <td className="px-4 py-2.5 align-top">
                      {r.issues.length ? (
                        <span className="inline-flex items-start gap-1.5">
                          <CircleAlert aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />
                          <span>{r.issues.join(". ")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <CircleCheck aria-hidden="true" className="text-chart-2 size-4" />
                          Ready
                        </span>
                      )}
                    </td>
                    {fields.filter((f) => map[f.key] != null).map((f) => (
                      <td key={f.key} className="max-w-44 truncate px-4 py-2.5 align-top">
                        {r.values[f.key] || <span className="text-muted-foreground">Empty</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!good.length ? (
            <p role="alert" className="text-destructive mt-4 text-sm">
              No row can be imported. Go back and check the column matches.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="py-4 text-center" aria-busy={phase === "running"}>
          {phase === "done" ? (
            <div role="status">
              <span aria-hidden="true" className="bg-chart-2/15 mx-auto flex size-14 items-center justify-center rounded-full">
                <CircleCheck className="size-7" />
              </span>
              <h2 ref={headingRef} tabIndex={-1} className="mt-5 text-2xl font-semibold tracking-tight outline-none">
                {good.length} {good.length === 1 ? "contact" : "contacts"} imported
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-pretty">{bad ? `${bad} ${bad === 1 ? "row was" : "rows were"} skipped because of problems.` : "Every row came in."}</p>
              <Button variant="outline" className="mt-6" onClick={reset}>
                Import another file
              </Button>
            </div>
          ) : (
            <div>
              <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">
                {phase === "running" ? "Importing…" : phase === "error" ? "The import stopped" : `Import ${good.length} ${good.length === 1 ? "row" : "rows"}`}
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-pretty">{phase === "running" ? "Keep this page open until it finishes." : phase === "error" ? (errorState?.description ?? message ?? "Nothing was lost. Your rows are still here, so try again.") : bad ? `${bad} ${bad === 1 ? "row" : "rows"} with problems will be skipped.` : "Every row is ready."}</p>
              {phase === "running" || phase === "error" ? (
                <div className="mx-auto mt-6 max-w-md">
                  <Progress value={good.length ? (done / good.length) * 100 : 0} aria-label="Import progress" />
                  <p className="text-muted-foreground mt-2 text-sm tabular-nums">
                    {done} of {good.length}
                  </p>
                </div>
              ) : null}
              {phase === "error" ? (
                <p role="alert" className="text-destructive mt-4 text-sm">
                  {message ?? "We could not finish the import."}
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {step > 0 && !(step === 3 && phase === "done") ? (
        <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={phase === "running"}>
            <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={(step === 1 && missing.length > 0) || (step === 2 && !good.length)}>
              {step === 2 ? `Continue with ${good.length} ${good.length === 1 ? "row" : "rows"}` : "Continue"}
              <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
            </Button>
          ) : (
            <Button onClick={run} disabled={phase === "running" || !good.length}>
              {phase === "running" ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
              {phase === "running" ? "Importing" : phase === "error" ? "Try again" : "Start import"}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )

  return (
    <section data-slot="import-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the importer" loading={<Skel />} error={{ title: errorState?.title ?? "The importer could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Import1, type Import1Props, type Import1Field, type Import1Row }
