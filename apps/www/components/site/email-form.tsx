"use client"

import { CheckCircle2, TriangleAlert } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string }

/**
 * One email field and a button, posting to a form endpoint (`/api/reminders`, `/api/sampler`). The consent line is part of the form on purpose: it says what the address
 * will be used for before it is sent. A hidden field catches bots.
 */
export function EmailForm<T = unknown>({
  endpoint,
  label,
  button,
  consent,
  doneMessage,
  onDone,
}: {
  endpoint: string
  label: string
  button: string
  consent: React.ReactNode
  doneMessage: string
  onDone?: (data: T) => void
}) {
  const id = React.useId()
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<Status>({ kind: "idle" })

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status.kind === "sending") return
    const website = (new FormData(e.currentTarget).get("website") as string) ?? ""
    setStatus({ kind: "sending" })
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, website }) })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setStatus({ kind: "error", message: data.error ?? "Something went wrong. Please try again." })
        return
      }
      setStatus({ kind: "done" })
      onDone?.(data as T)
    } catch {
      setStatus({ kind: "error", message: "We could not reach the server. Please check your connection and try again." })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${id}-email`} className="sr-only">
            {label}
          </label>
          <Input
            id={`${id}-email`}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={status.kind === "error" ? true : undefined}
            aria-describedby={`${id}-consent ${id}-status`}
          />
        </div>
        <Button type="submit" size="lg" loading={status.kind === "sending"} className="sm:min-w-44">
          {button}
        </Button>
      </div>
      {/* Bots fill every field; people never see this one. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p id={`${id}-consent`} className="text-muted-foreground text-xs leading-relaxed">
        {consent}
      </p>
      <div id={`${id}-status`} role="status" aria-live="polite">
        {status.kind === "done" && (
          <p className="flex items-start gap-2 text-sm font-medium">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {doneMessage}
          </p>
        )}
        {status.kind === "error" && (
          <p className="text-destructive flex items-start gap-2 text-sm" role="alert">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {status.message}
          </p>
        )}
      </div>
    </form>
  )
}
