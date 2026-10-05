"use client"

import { ArrowRight, ClipboardPaste, KeyRound, ShieldCheck, TriangleAlert } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { GlowBorder } from "@/components/ballmac/glow-border"
import { Input } from "@/components/ballmac/input"
import { login } from "@/components/pro/session"

/** The login: one field for the licence key. Success is picked up by the session store, which swaps the page to the library. */
export function UnlockCard({ portalUrl }: { portalUrl?: string }) {
  const [value, setValue] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const id = React.useId()
  const field = `${id}-key`
  const hint = `${id}-hint`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!value.trim()) return setError("Paste your licence key first.")
    setBusy(true)
    setError(null)
    const result = await login(value)
    // On success the session store changes and this card is replaced by the library, so start at its top. A failure stays here.
    if (result.ok) window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
    else {
      setError(result.reason)
      setBusy(false)
    }
  }

  async function paste() {
    try {
      const text = (await navigator.clipboard.readText()).trim()
      if (text) {
        setValue(text)
        setError(null)
      }
    } catch {
      // Reading the clipboard needs permission; typing or pasting with the keyboard still works.
    }
  }

  return (
    <GlowBorder radius={22} width={1.5} glow={0.35} duration={6} className="w-full">
      <form onSubmit={submit} className="p-6 sm:p-8" noValidate>
        <div className="flex items-center gap-3">
          <span className="bg-foreground text-background flex size-10 items-center justify-center rounded-xl" aria-hidden="true">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h2 className="text-lg leading-tight font-semibold tracking-tight">Unlock your library</h2>
            <p className="text-muted-foreground text-sm">Paste the licence key from your receipt.</p>
          </div>
        </div>

        <label htmlFor={field} className="mt-7 block text-sm font-medium">
          Licence key
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id={field}
            name="license-key"
            size="lg"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Paste your key"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${hint} ${field}-error` : hint}
            className="font-mono tracking-tight"
          />
          <Button type="button" variant="outline" size="lg" onClick={paste} aria-label="Paste from clipboard" className="shrink-0 px-3.5">
            <ClipboardPaste className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Paste</span>
          </Button>
        </div>
        <p id={`${field}-error`} role="alert" className={error ? "text-destructive mt-2.5 flex items-start gap-2 text-sm" : "sr-only"}>
          {error && <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          {error}
        </p>

        <Button type="submit" size="lg" loading={busy} className="mt-5 w-full">
          {busy ? "Checking your key" : "Unlock"}
          {!busy && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>

        <p id={hint} className="text-muted-foreground mt-5 flex items-start gap-2 text-[13px] leading-5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            No password and no account. Your key is kept in an encrypted cookie in this browser, and you can log out any time.
          </span>
        </p>

        <details className="group mt-5 border-t pt-4 text-sm">
          <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 cursor-pointer rounded-sm outline-none select-none focus-visible:ring-[3px]">
            I can&apos;t find my key
          </summary>
          <ul className="text-muted-foreground mt-3 list-disc space-y-1.5 pl-5 leading-6">
            <li>Look for the purchase email from our payment partner and check the spam folder. The key is in that email.</li>
            {portalUrl && (
              <li>
                Open your <a href={portalUrl} className="text-foreground underline underline-offset-4">customer portal</a> to see it again.
              </li>
            )}
            <li>
              Still stuck? <a href="/support?topic=license" className="text-foreground underline underline-offset-4">Contact support</a> from the email you bought with.
            </li>
          </ul>
        </details>
      </form>
    </GlowBorder>
  )
}
