"use client"

import * as React from "react"

import { MacWindow, MacWindowContent, MacWindowMain, MacWindowTitleBar } from "@/components/ballmac/mac-window"
import {
  SheetDialog,
  SheetDialogButton,
  SheetDialogContent,
  SheetDialogDescription,
  SheetDialogFooter,
  SheetDialogTitle,
  SheetDialogTrigger,
} from "@/components/ballmac/sheet-dialog"

export default function SheetDialogForm() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("Untitled")
  const [saved, setSaved] = React.useState<string | null>(null)

  return (
    <div className="w-full max-w-[560px]">
      <MacWindow ref={ref} className="relative h-[280px] w-full overflow-hidden">
        <MacWindowMain>
          <MacWindowTitleBar title={saved ?? "Untitled"} />
          <MacWindowContent className="flex flex-col items-start gap-3 p-6">
            <SheetDialog container={ref} open={open} onOpenChange={setOpen}>
              <SheetDialogTrigger className="inline-flex h-[22px] items-center rounded-[6px] border border-foreground/15 bg-background px-3 text-[13px] shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                Save As…
              </SheetDialogTrigger>
              <SheetDialogContent>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSaved(name.trim() || "Untitled")
                    setOpen(false)
                  }}
                >
                  <div>
                    <SheetDialogTitle>Save As</SheetDialogTitle>
                    <SheetDialogDescription>Choose a name for the document.</SheetDialogDescription>
                  </div>
                  <label className="flex items-center gap-3 text-[13px]">
                    <span className="w-14 text-end text-muted-foreground">Name:</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-6 min-w-0 flex-1 rounded-[5px] border border-foreground/15 bg-background px-2 text-[13px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </label>
                  <SheetDialogFooter>
                    <SheetDialogButton onClick={() => setOpen(false)}>Cancel</SheetDialogButton>
                    <SheetDialogButton type="submit" primary>Save</SheetDialogButton>
                  </SheetDialogFooter>
                </form>
              </SheetDialogContent>
            </SheetDialog>
            <p className="text-sm text-muted-foreground">{saved ? `Saved as “${saved}”.` : "Not saved yet."}</p>
          </MacWindowContent>
        </MacWindowMain>
      </MacWindow>
    </div>
  )
}
