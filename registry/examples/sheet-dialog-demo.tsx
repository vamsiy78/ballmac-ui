"use client"

import * as React from "react"
import { KeyRound } from "lucide-react"

import { MacWindow, MacWindowContent, MacWindowMain, MacWindowTitleBar } from "@/components/ballmac/mac-window"
import {
  SheetDialog,
  SheetDialogButton,
  SheetDialogContent,
  SheetDialogDescription,
  SheetDialogFooter,
  SheetDialogHeader,
  SheetDialogTitle,
  SheetDialogTrigger,
} from "@/components/ballmac/sheet-dialog"
import { AppIcon } from "@/components/ballmac/mac-icons"

export default function SheetDialogDemo() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [saved, setSaved] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative isolate flex w-full max-w-[640px] justify-center overflow-hidden rounded-2xl border border-foreground/10 px-4 py-8 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-1 via-chart-4 to-chart-5" />
        <div className="absolute -inset-x-1/4 top-1/3 h-full rounded-[50%] bg-white/20 blur-2xl" />
      </div>
      <MacWindow ref={ref} className="relative h-[300px] w-full overflow-hidden">
        <MacWindowMain>
          <MacWindowTitleBar title="Keychain Access" />
          <MacWindowContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-muted-foreground">{saved ? "Password saved to your keychain." : "Nothing saved yet."}</p>
            <SheetDialog container={ref} open={open} onOpenChange={setOpen}>
              <SheetDialogTrigger className="inline-flex h-[22px] items-center rounded-[6px] border border-foreground/15 bg-background px-3 text-[13px] shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                Save Password…
              </SheetDialogTrigger>
              <SheetDialogContent>
                <SheetDialogHeader>
                  <AppIcon size={48} tone="graphite"><KeyRound /></AppIcon>
                  <div>
                    <SheetDialogTitle>Save this password?</SheetDialogTitle>
                    <SheetDialogDescription>It will be stored in your keychain and filled in on this Mac and your other devices.</SheetDialogDescription>
                  </div>
                </SheetDialogHeader>
                <SheetDialogFooter>
                  <SheetDialogButton onClick={() => setOpen(false)}>Not Now</SheetDialogButton>
                  <SheetDialogButton
                    primary
                    onClick={() => {
                      setSaved(true)
                      setOpen(false)
                    }}
                  >
                    Save
                  </SheetDialogButton>
                </SheetDialogFooter>
              </SheetDialogContent>
            </SheetDialog>
          </MacWindowContent>
        </MacWindowMain>
      </MacWindow>
    </div>
  )
}
