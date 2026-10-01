"use client"

import * as React from "react"

import { Kbd } from "@/components/ballmac/kbd"
import { KeyboardShortcutsDialog } from "@/components/ballmac/keyboard-shortcuts"

export default function KeyboardShortcutsDialogExample() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="grid justify-items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Keyboard shortcuts
        <Kbd>?</Kbd>
      </button>
      <KeyboardShortcutsDialog
        open={open}
        onOpenChange={setOpen}
        groups={[
          { title: "General", shortcuts: [{ label: "Open command menu", keys: ["Mod", "K"] }, { label: "Show shortcuts", keys: ["?"] }, { label: "Save", keys: ["Mod", "S"] }] },
          { title: "Navigation", shortcuts: [{ label: "Go to inbox", keys: ["G", "I"], sequence: true }, { label: "Go to settings", keys: ["G", "S"], sequence: true }, { label: "Close panel", keys: ["Esc"] }] },
        ]}
      />
    </div>
  )
}
