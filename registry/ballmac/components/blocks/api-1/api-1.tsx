// Ballmac UI: API 1. https://ui.ballmac.com/blocks/api-1
"use client"

import * as React from "react"
import { CircleAlert, History, Loader2, Plus, Send, Terminal, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CopyButton } from "@/components/ballmac/copy-button"
import { Input } from "@/components/ballmac/input"
import { JsonViewer } from "@/components/ballmac/json-viewer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Textarea } from "@/components/ballmac/textarea"
import { cn } from "@/lib/utils"

type Api1Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
type Api1Pair = { id: string; key: string; value: string }
type Api1Request = { method: Api1Method; url: string; headers: Api1Pair[]; body: string }
type Api1Response = { status: number; statusText: string; ms: number; headers: Record<string, string>; body: unknown }

type Api1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    /** Starting request. */
    defaultRequest?: Partial<Api1Request>
    /** Called to send the request. Return the response; reject for a network failure. Without it a built-in demo API answers. */
    onSend?: (request: Api1Request) => Promise<Api1Response>
    /** Show a response at first, for showing that screen. */
    defaultResponse?: Api1Response
}

const methods: Api1Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]
const methodDot: Record<Api1Method, string> = { GET: "bg-chart-2", POST: "bg-chart-1", PUT: "bg-amber-500", PATCH: "bg-amber-500", DELETE: "bg-destructive" }

const users = [
  { id: "usr_1", name: "Mara Ellison", email: "mara@acme.com", role: "owner" },
  { id: "usr_2", name: "Theo Nakamura", email: "theo@acme.com", role: "admin" },
  { id: "usr_3", name: "Priya Shah", email: "priya@acme.com", role: "member" },
]

// A tiny pretend API so the block works with no server. It checks the same things a real one would.
async function demoApi(r: Api1Request): Promise<Api1Response> {
  const path = r.url.replace(/^https?:\/\/[^/]+/, "").split("?")[0]!
  const authed = r.headers.some((h) => h.key.toLowerCase() === "authorization" && h.value.trim().length > 7)
  const base = { headers: { "content-type": "application/json", "x-request-id": "req_8f3a1c" } }
  const ms = 90 + ((path.length * 37) % 140)
  await new Promise((res) => setTimeout(res, 350))
  if (!authed) return { ...base, status: 401, statusText: "Unauthorized", ms, body: { error: { code: "missing_credentials", message: "Add an Authorization header with a Bearer token." } } }
  if (path === "/v1/users" && r.method === "GET") return { ...base, status: 200, statusText: "OK", ms, body: { data: users, has_more: false } }
  const one = path.match(/^\/v1\/users\/(\w+)$/)
  if (one && r.method === "GET") {
    const u = users.find((x) => x.id === one[1])
    return u ? { ...base, status: 200, statusText: "OK", ms, body: u } : { ...base, status: 404, statusText: "Not Found", ms, body: { error: { code: "not_found", message: `No user with id ${one[1]}.` } } }
  }
  if (path === "/v1/users" && r.method === "POST") {
    let b: unknown
    try {
      b = JSON.parse(r.body || "{}")
    } catch {
      return { ...base, status: 400, statusText: "Bad Request", ms, body: { error: { code: "invalid_json", message: "The body is not valid JSON." } } }
    }
    const o = b as { name?: string; email?: string }
    if (!o.email) return { ...base, status: 422, statusText: "Unprocessable Entity", ms, body: { error: { code: "invalid_request", message: "email is required.", param: "email" } } }
    return { ...base, status: 201, statusText: "Created", ms, body: { id: "usr_4", name: o.name ?? "", email: o.email, role: "member" } }
  }
  return { ...base, status: 404, statusText: "Not Found", ms, body: { error: { code: "not_found", message: `No route for ${r.method} ${path}.` } } }
}

const pair = (id: string, key = "", value = ""): Api1Pair => ({ id, key, value })

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

const statusTone = (s: number) => (s >= 500 ? "bg-destructive/10 border-destructive/40" : s >= 400 ? "bg-amber-500/15 border-amber-500/40" : "bg-chart-2/10 border-chart-2/30")

/**
 * An API explorer: choose a method, type an address, add headers and a JSON body, send, and read the answer: its status in words, how long it
 * took, how big it was, and the body as a collapsible tree. A broken body is caught before sending, every request is kept in a history you can go
 * back to, and "Copy as cURL" writes the matching command. A built-in demo API answers when no handler is passed.
 */
function Api1({ title = "API explorer", defaultRequest, onSend, defaultResponse, state = "ready", onRetry, errorState, className, ...props }: Api1Props) {
  const id = React.useId()
  const [req, setReq] = React.useState<Api1Request>({ method: "GET", url: "https://api.acme.com/v1/users", headers: [pair("h1", "Authorization", "Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc"), pair("h2", "Accept", "application/json")], body: '{\n  "name": "Sam Okafor",\n  "email": "sam@acme.com"\n}', ...defaultRequest })
  // Ids for added rows count up from a ref, so they are the same on the server and in the browser.
  const nextId = React.useRef(3)
  const [tab, setTab] = React.useState<"headers" | "body">("headers")
  const [resTab, setResTab] = React.useState<"body" | "headers">("body")
  const [res, setRes] = React.useState<Api1Response | null>(defaultResponse ?? null)
  const [sending, setSending] = React.useState(false)
  const [failure, setFailure] = React.useState<string>()
  const [history, setHistory] = React.useState<{ req: Api1Request; status: number | null }[]>([])
  const hasBody = req.method !== "GET" && req.method !== "DELETE"

  const bodyError = React.useMemo(() => {
    if (!hasBody || !req.body.trim()) return null
    try {
      JSON.parse(req.body)
      return null
    } catch (e) {
      return e instanceof Error ? e.message.replace(/^JSON\.parse: /, "") : "Not valid JSON"
    }
  }, [hasBody, req.body])
  const urlError = /^https?:\/\/\S+$/.test(req.url.trim()) ? null : "Enter a full address that starts with https://"

  const curl = React.useMemo(() => {
    const parts = [`curl -X ${req.method} '${req.url}'`, ...req.headers.filter((h) => h.key.trim()).map((h) => `  -H '${h.key}: ${h.value}'`)]
    if (hasBody && req.body.trim()) parts.push(`  -d '${req.body.replace(/\s*\n\s*/g, " ").replace(/'/g, "'\\''")}'`)
    return parts.join(" \\\n")
  }, [req, hasBody])

  async function send() {
    if (urlError || bodyError || sending) return
    setSending(true)
    setFailure(undefined)
    try {
      const r = await (onSend ?? demoApi)(req)
      setRes(r)
      setHistory((h) => [{ req, status: r.status }, ...h].slice(0, 6))
    } catch (e) {
      setRes(null)
      setFailure(e instanceof Error ? e.message : "The request could not be sent.")
      setHistory((h) => [{ req, status: null }, ...h].slice(0, 6))
    } finally {
      setSending(false)
    }
  }
  const setPair = (pid: string, p: Partial<Api1Pair>) => setReq((r) => ({ ...r, headers: r.headers.map((h) => (h.id === pid ? { ...h, ...p } : h)) }))
  const size = res ? new Blob([JSON.stringify(res.body)]).size : 0

  const content = (
    <div className="grid gap-6">
      <form onSubmit={(e) => { e.preventDefault(); void send() }} noValidate>
        <div className="bg-card flex flex-col gap-2 rounded-2xl border p-2 sm:flex-row">
          <Select value={req.method} onValueChange={(v) => setReq({ ...req, method: v as Api1Method })}>
            <SelectTrigger aria-label="Method" className="w-full font-mono font-semibold sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {methods.map((m) => (
                <SelectItem key={m} value={m} className="font-mono font-semibold">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input dir="ltr" aria-label="Address" aria-invalid={!!urlError} value={req.url} onChange={(e) => setReq({ ...req, url: e.target.value })} className="flex-1 font-mono text-sm" spellCheck={false} />
          <Button type="submit" disabled={sending || !!urlError || !!bodyError}>
            {sending ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Send aria-hidden="true" className="rtl:-scale-x-100" />}
            {sending ? "Sending" : "Send"}
          </Button>
        </div>
        {urlError ? <p role="alert" className="text-destructive mt-2 ps-2 text-sm">{urlError}</p> : null}
      </form>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="bg-card min-w-0 rounded-2xl border">
          <div role="tablist" aria-label="Request" className="flex gap-1 border-b px-3 pt-3">
            {([["headers", `Headers · ${req.headers.filter((h) => h.key.trim()).length}`], ["body", "Body"]] as const).map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("focus-visible:ring-ring/50 -mb-px rounded-t-md border-b-2 px-3.5 py-2 text-sm font-medium outline-none focus-visible:ring-[3px]", tab === k ? "border-foreground" : "text-muted-foreground border-transparent")}>
                {l}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="p-4">
            {tab === "headers" ? (
              <div className="grid gap-2.5">
                {req.headers.map((h, i) => (
                  <div key={h.id} className="flex items-center gap-2">
                    <Input dir="ltr" aria-label={`Header ${i + 1} name`} value={h.key} onChange={(e) => setPair(h.id, { key: e.target.value })} placeholder="Name" className="w-2/5 font-mono text-xs" spellCheck={false} />
                    <Input dir="ltr" aria-label={`Header ${i + 1} value`} value={h.value} onChange={(e) => setPair(h.id, { value: e.target.value })} placeholder="Value" className="flex-1 font-mono text-xs" spellCheck={false} />
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove header ${i + 1}`} onClick={() => setReq((r) => ({ ...r, headers: r.headers.filter((x) => x.id !== h.id) }))}>
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setReq((r) => ({ ...r, headers: [...r.headers, pair(`h${nextId.current++}`)] }))}>
                  <Plus aria-hidden="true" />
                  Add header
                </Button>
              </div>
            ) : hasBody ? (
              <div>
                <Textarea dir="ltr" aria-label="Request body (JSON)" aria-invalid={!!bodyError} value={req.body} onChange={(e) => setReq({ ...req, body: e.target.value })} rows={9} spellCheck={false} className="font-mono text-xs" />
                {bodyError ? (
                  <p role="alert" className="text-destructive mt-2 flex items-start gap-2 text-sm">
                    <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    The body is not valid JSON: {bodyError}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground py-6 text-center text-sm">{req.method} requests do not send a body.</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Terminal aria-hidden="true" className="size-3.5" />
              Same request as a command
            </p>
            <CopyButton getValue={() => curl} label="Copy as cURL" copiedLabel="Copied" variant="outline" />
          </div>
        </div>

        <div className="bg-card min-w-0 rounded-2xl border" aria-live="polite" aria-busy={sending}>
          {sending ? (
            <div className="grid gap-3 p-6" aria-label="Waiting for a response">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-44" />
            </div>
          ) : failure ? (
            <div role="alert" className="p-8 text-center">
              <span aria-hidden="true" className="bg-destructive/10 mx-auto flex size-12 items-center justify-center rounded-full">
                <CircleAlert className="size-6" />
              </span>
              <p className="mt-4 font-semibold">No response</p>
              <p className="text-muted-foreground mt-1 text-sm text-pretty">{failure}</p>
            </div>
          ) : res ? (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 text-sm">
                <span className={cn("rounded-md border px-2.5 py-1 font-mono font-semibold tabular-nums", statusTone(res.status))}>
                  {res.status} {res.statusText}
                </span>
                <span className="text-muted-foreground tabular-nums">{res.ms} ms</span>
                <span className="text-muted-foreground tabular-nums">{size >= 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`}</span>
              </div>
              <div role="tablist" aria-label="Response" className="flex gap-1 px-3 pt-3">
                {(["body", "headers"] as const).map((k) => (
                  <button key={k} type="button" role="tab" aria-selected={resTab === k} onClick={() => setResTab(k)} className={cn("focus-visible:ring-ring/50 -mb-px rounded-t-md border-b-2 px-3.5 py-2 text-sm font-medium capitalize outline-none focus-visible:ring-[3px]", resTab === k ? "border-foreground" : "text-muted-foreground border-transparent")}>
                    {k}
                  </button>
                ))}
              </div>
              <div role="tabpanel" className="max-h-96 overflow-auto border-t p-4">
                {resTab === "body" ? (
                  <JsonViewer value={res.body} label="Response body" defaultExpandedDepth={3} />
                ) : (
                  <dl className="grid gap-2 font-mono text-xs" dir="ltr">
                    {Object.entries(res.headers).map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <dt className="text-muted-foreground w-40 shrink-0">{k}</dt>
                        <dd className="break-all">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </>
          ) : (
            <div className="p-10 text-center">
              <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
                <Send className="size-5 rtl:-scale-x-100" />
              </span>
              <p className="mt-4 font-semibold">Send a request</p>
              <p className="text-muted-foreground mt-1 text-sm text-pretty">The answer appears here with its status, how long it took and its body.</p>
            </div>
          )}
        </div>
      </div>

      {history.length ? (
        <div className="bg-card rounded-2xl border">
          <h2 className="flex items-center gap-2 border-b px-5 py-3.5 text-sm font-semibold">
            <History aria-hidden="true" className="size-4" />
            History
          </h2>
          <ul className="divide-y">
            {history.map((h, i) => (
              <li key={i}>
                <button type="button" onClick={() => setReq(h.req)} className="hover:bg-accent/40 focus-visible:ring-ring/50 flex w-full items-center gap-3 px-5 py-2.5 text-start text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset motion-reduce:transition-none">
                  <span className="flex w-16 items-center gap-2 font-mono text-xs font-semibold">
                    <span aria-hidden="true" className={cn("size-2 rounded-full", methodDot[h.req.method])} />
                    {h.req.method}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs" dir="ltr">
                    {h.req.url.replace(/^https?:\/\//, "")}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">{h.status ?? "No reply"}</span>
                  <span className="sr-only">Use this request again</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )

  return (
    <section data-slot="api-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Try a request without leaving the page.</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the explorer" loading={<Skel />} error={{ title: errorState?.title ?? "The explorer could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Api1, type Api1Props, type Api1Request, type Api1Response, type Api1Method }
