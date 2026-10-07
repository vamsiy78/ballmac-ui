"use client"

import { CheckCircle2, TriangleAlert } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"

type Option = { id: string; label: string }
type Desk = { eligible: boolean; email: string; options: Option[] }
type Result = { kind: "ok" } | { kind: "error"; message: string } | null

async function send(body: unknown): Promise<Result> {
  try {
    const res = await fetch("/api/pro/founders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    return res.ok ? { kind: "ok" } : { kind: "error", message: data.error ?? "Something went wrong. Please try again." }
  } catch {
    return { kind: "error", message: "We could not reach the server. Please try again." }
  }
}

function Note({ result }: { result: Result }) {
  return (
    <div role="status" aria-live="polite">
      {result?.kind === "ok" && (
        <p className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="size-4" aria-hidden="true" /> Sent. Thank you.
        </p>
      )}
      {result?.kind === "error" && (
        <p className="text-destructive flex items-center gap-2 text-sm" role="alert">
          <TriangleAlert className="size-4" aria-hidden="true" /> {result.message}
        </p>
      )}
    </div>
  )
}

/** The Founders desk: only shown for founding licences. Ask to be listed on the Founders page and vote on the next blocks. */
export function FoundersDesk() {
  const id = React.useId()
  const [desk, setDesk] = React.useState<Desk | null>(null)
  const [name, setName] = React.useState("")
  const [picked, setPicked] = React.useState<string[]>([])
  const [nameResult, setNameResult] = React.useState<Result>(null)
  const [voteResult, setVoteResult] = React.useState<Result>(null)
  const [busy, setBusy] = React.useState<"name" | "vote" | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetch("/api/pro/founders", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Desk>) : null))
      .then((d) => {
        if (!cancelled) setDesk(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!desk?.eligible) return null
  const toggle = (optionId: string) => setPicked((p) => (p.includes(optionId) ? p.filter((x) => x !== optionId) : p.length >= 3 ? p : [...p, optionId]))

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-14 sm:px-6">
    <section aria-labelledby={`${id}-title`} className="bg-card space-y-6 rounded-2xl border p-6 sm:p-8">
      <div>
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
          Founders desk
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          You hold a founding licence. Your price stays as it is for every future Pro update. You can ask to be listed on the{" "}
          <a href="/founders" className="text-foreground underline underline-offset-4">
            Founders page
          </a>
          , vote on the next blocks, and write to us directly at{" "}
          <a href={`mailto:${desk.email}?subject=Founding%20member`} className="text-foreground underline underline-offset-4">
            {desk.email}
          </a>
          .
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy("name")
          setNameResult(await send({ kind: "name", name }))
          setBusy(null)
        }}
      >
        <label htmlFor={`${id}-name`} className="text-sm font-medium">
          Name for the Founders page (optional)
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id={`${id}-name`} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="How you want to be listed" autoComplete="name" className="sm:max-w-sm" />
          <Button type="submit" variant="outline" loading={busy === "name"} disabled={name.trim().length < 2}>
            List my name
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">We add names by hand, only for people who ask here. The page is public.</p>
        <Note result={nameResult} />
      </form>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy("vote")
          setVoteResult(await send({ kind: "vote", choices: picked }))
          setBusy(null)
        }}
      >
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">What should we build next? Pick up to three.</legend>
          {desk.options.map((o) => (
            <label key={o.id} className="flex items-start gap-2.5 text-sm">
              <input type="checkbox" className="mt-0.5 size-4" checked={picked.includes(o.id)} disabled={!picked.includes(o.id) && picked.length >= 3} onChange={() => toggle(o.id)} />
              {o.label}
            </label>
          ))}
        </fieldset>
        <Button type="submit" variant="outline" loading={busy === "vote"} disabled={picked.length === 0}>
          Send my vote
        </Button>
        <Note result={voteResult} />
      </form>
    </section>
    </div>
  )
}
