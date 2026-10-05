"use client"

import { Check, Copy, Eye, EyeOff, LogOut } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { logout } from "@/components/pro/session"
import { maskKey } from "@/lib/pro-session-core"

/** The buyer's key, masked by default (safe on a shared screen), with reveal, copy and log out. */
export function KeyChip({ licenseKey }: { licenseKey: string }) {
  const [shown, setShown] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-card flex h-9 min-w-0 items-center gap-1 rounded-lg border pr-1 pl-3 shadow-xs">
        <span className="text-muted-foreground text-xs">Key</span>
        <code className="max-w-[44vw] truncate px-1.5 font-mono text-[13px] sm:max-w-[26ch]" aria-label={shown ? "Licence key" : "Licence key, hidden"}>
          {shown ? licenseKey : maskKey(licenseKey)}
        </code>
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? "Hide key" : "Show key"}
          aria-pressed={shown}
          className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-[3px]"
        >
          {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy key"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(licenseKey)
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            } catch {
              // Clipboard unavailable: reveal the key so it can be selected.
              setShown(true)
            }
          }}
          className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-[3px]"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <Button variant="ghost" size="sm" onClick={() => logout()}>
        <LogOut className="size-3.5" aria-hidden="true" />
        Log out
      </Button>
    </div>
  )
}
