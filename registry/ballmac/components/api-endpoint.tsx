// Ballmac UI: API Endpoint. https://ui.ballmac.com/components/api-endpoint
"use client"

import * as React from "react"
import { ChevronDown, Lock } from "lucide-react"
import { Collapsible as CollapsiblePrimitive, Tabs as TabsPrimitive } from "radix-ui"

import { CopyButton } from "@/components/ballmac/copy-button"
import { highlightLines, tokenClass, type HighlightLanguage } from "@/lib/ballmac/highlight"
import { cn } from "@/lib/utils"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type EndpointParameter = {
  /** Parameter name. */
  name: string
  /** Where it goes. */
  in: "path" | "query" | "header" | "body"
  /** Type shown in mono, such as "string" or "integer". */
  type: string
  /** The caller must send it. */
  required?: boolean
  /** What it means. */
  description?: string
  /** Default value when omitted. */
  default?: string
}

type EndpointResponse = {
  /** HTTP status code. */
  status: number
  /** Short meaning, such as "Customer created". */
  description: string
  /** Example body, usually JSON. */
  example?: string
  /** Highlighter for the example. */
  language?: HighlightLanguage
}

const METHOD_STYLE: Record<HttpMethod, string> = {
  GET: "border-chart-2/40 bg-chart-2/10",
  POST: "border-chart-1/40 bg-chart-1/10",
  PUT: "border-chart-3/40 bg-chart-3/10",
  PATCH: "border-chart-3/40 bg-chart-3/10",
  DELETE: "border-destructive/40 bg-destructive/10",
}

function statusMeaning(code: number) {
  if (code < 300) return "Success"
  if (code < 400) return "Redirect"
  if (code < 500) return "Client error"
  return "Server error"
}

function statusDot(code: number) {
  return code < 300 ? "bg-chart-2" : code < 400 ? "bg-chart-1" : code < 500 ? "bg-chart-3" : "bg-destructive"
}

/** Splits "/v1/customers/{id}" so path parameters can be styled. */
function pathParts(path: string) {
  return path.split(/(\{[^}]+\})/g).filter(Boolean)
}

function Code({ code, language, label }: { code: string; language: HighlightLanguage; label: string }) {
  const lines = React.useMemo(() => highlightLines(code, language), [code, language])
  return (
    <div className="relative">
      <pre
        role="region"
        aria-label={label}
        tabIndex={0}
        className="max-h-72 overflow-auto rounded-lg border bg-muted/40 p-3.5 font-mono text-xs leading-5 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <code className="grid">
          {lines.map((line, i) => (
            <span key={i} className="whitespace-pre">
              {line.length === 0 ? " " : line.map((t, j) => <span key={j} className={tokenClass[t.type]}>{t.text}</span>)}
            </span>
          ))}
        </code>
      </pre>
      <CopyButton size="sm" variant="outline" value={code} ariaLabel={`Copy ${label}`} className="absolute top-2 right-2 bg-background/90 backdrop-blur" />
    </div>
  )
}

type ApiEndpointProps = Omit<React.ComponentProps<"div">, "title" | "children"> & {
  /** HTTP method. */
  method: HttpMethod
  /** Path, with `{name}` for path parameters. */
  path: string
  /** Short name of the operation, such as "Create a customer". */
  summary: string
  /** Longer explanation. */
  description?: string
  /** Base URL used by the "Copy URL" button. */
  baseUrl?: string
  /** Authentication needed, such as "Bearer token". Shown as a lock chip. */
  auth?: string
  /** Request fields. */
  parameters?: EndpointParameter[]
  /** Example request body. */
  requestExample?: string
  /** Highlighter for the request body. */
  requestLanguage?: HighlightLanguage
  /** Possible responses. */
  responses?: EndpointResponse[]
  /** Open at first. */
  defaultOpen?: boolean
  /** Controlled open state. */
  open?: boolean
  /** Called when the card opens or closes. */
  onOpenChange?: (open: boolean) => void
}

const GROUPS: EndpointParameter["in"][] = ["path", "query", "header", "body"]

function ApiEndpoint({
  method,
  path,
  summary,
  description,
  baseUrl,
  auth,
  parameters = [],
  requestExample,
  requestLanguage = "json",
  responses = [],
  defaultOpen = true,
  open,
  onOpenChange,
  className,
  ...props
}: ApiEndpointProps) {
  const panelId = React.useId()
  const tabs = [
    ...(requestExample ? [{ id: "request", label: "Request", dot: "bg-muted-foreground" }] : []),
    ...responses.map((r) => ({ id: String(r.status), label: String(r.status), dot: statusDot(r.status) })),
  ]
  const [tab, setTab] = React.useState(tabs[0]?.id ?? "")
  const url = `${(baseUrl ?? "").replace(/\/$/, "")}${path}`

  return (
    <CollapsiblePrimitive.Root
      data-slot="api-endpoint"
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs", className)}
      {...props}
    >
      <div className="flex items-center gap-1 pr-2">
        <CollapsiblePrimitive.Trigger
          aria-controls={panelId}
          className="group flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 motion-reduce:transition-none"
        >
          <span
            className={cn(
              "inline-flex h-6 min-w-14 shrink-0 items-center justify-center rounded-md border px-2 font-mono text-[11px] font-bold tracking-wide text-foreground",
              METHOD_STYLE[method]
            )}
          >
            {method}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-mono text-[13px] font-medium text-foreground">
              {pathParts(path).map((part, i) =>
                part.startsWith("{") ? (
                  <span key={i} className="-mx-px rounded-[4px] bg-muted px-0.5 text-foreground">
                    {part}
                  </span>
                ) : (
                  <React.Fragment key={i}>{part}</React.Fragment>
                )
              )}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{summary}</span>
          </span>
          {auth && (
            <span className="hidden shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-foreground sm:inline-flex">
              <Lock aria-hidden="true" className="size-3" />
              {auth}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </CollapsiblePrimitive.Trigger>
        <CopyButton size="sm" value={url} ariaLabel={`Copy URL for ${method} ${path}`} />
      </div>
      <CollapsiblePrimitive.Content
        id={panelId}
        className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none"
      >
        <div className="grid gap-5 border-t p-4 @container">
          {description && <p className="text-sm leading-6 text-muted-foreground">{description}</p>}
          {auth && (
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-foreground sm:hidden">
              <Lock aria-hidden="true" className="size-3" />
              {auth}
            </p>
          )}

          {GROUPS.map((group) => {
            const items = parameters.filter((p) => p.in === group)
            if (items.length === 0) return null
            return (
              <section key={group} aria-label={`${group} parameters`}>
                <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group === "body" ? "Body" : `${group[0]!.toUpperCase()}${group.slice(1)} parameters`}
                </h4>
                <ul className="divide-y rounded-lg border">
                  {items.map((p) => (
                    <li key={p.name} className="grid gap-1 px-3 py-2.5 @md:grid-cols-[minmax(0,13rem)_1fr] @md:gap-4">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <code className="font-mono text-[13px] font-medium text-foreground">{p.name}</code>
                        <span className="font-mono text-xs text-muted-foreground">{p.type}</span>
                        {p.required && (
                          <span className="rounded-full border border-destructive/40 bg-destructive/10 px-1.5 text-[11px] leading-4 font-medium text-foreground">
                            required
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] leading-5 text-muted-foreground">
                        {p.description}
                        {p.default !== undefined && (
                          <span>
                            {p.description ? " " : ""}Default: <code className="font-mono text-foreground">{p.default}</code>
                          </span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          {tabs.length > 0 && (
            <TabsPrimitive.Root value={tab} onValueChange={setTab} className="grid gap-2.5">
              <TabsPrimitive.List aria-label="Request and responses" className="flex flex-wrap items-center gap-1">
                {tabs.map((t) => (
                  <TabsPrimitive.Trigger
                    key={t.id}
                    value={t.id}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 font-mono text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=active]:bg-muted data-[state=active]:text-foreground motion-reduce:transition-none"
                  >
                    <span aria-hidden="true" className={cn("size-1.5 rounded-full", t.dot)} />
                    {t.label}
                  </TabsPrimitive.Trigger>
                ))}
              </TabsPrimitive.List>
              {requestExample && (
                <TabsPrimitive.Content value="request" className="grid gap-2 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <Code code={requestExample} language={requestLanguage} label="request body" />
                </TabsPrimitive.Content>
              )}
              {responses.map((r) => (
                <TabsPrimitive.Content key={r.status} value={String(r.status)} className="grid gap-2 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <p className="text-[13px] text-foreground">
                    <span className="font-medium">{statusMeaning(r.status)}.</span>{" "}
                    <span className="text-muted-foreground">{r.description}</span>
                  </p>
                  {r.example && <Code code={r.example} language={r.language ?? "json"} label={`${r.status} response body`} />}
                </TabsPrimitive.Content>
              ))}
            </TabsPrimitive.Root>
          )}
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

export { ApiEndpoint, type ApiEndpointProps, type EndpointParameter, type EndpointResponse, type HttpMethod }
