"use client"

import { ChevronLeft, FileText, Share } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button } from "@/components/ballmac/button"
import type { FeelId } from "@/lib/ballmac/feel"

const feels: { feel: FeelId; label: string }[] = [
  { feel: "macos", label: "macOS" },
  { feel: "windows", label: "Windows" },
  { feel: "ios", label: "iOS" },
]

/** The same window in three feels: only the chrome and the tokens differ, the markup is identical. */
export default function AppWindowFeels() {
  return (
    <div className="grid w-full max-w-[960px] gap-6 md:grid-cols-3">
      {feels.map(({ feel, label }) => (
        <figure key={feel} data-feel={feel} className="grid gap-2">
          <AppWindow feel={feel} active onClose={() => {}} onMinimize={() => {}} onMaximize={() => {}} className="h-56 shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))]">
            <AppWindowTitleBar
              title="Quarterly plan"
              icon={<FileText />}
              leading={feel === "ios" ? <ChevronLeft className="text-primary size-5 rtl:rotate-180" aria-hidden="true" /> : undefined}
            >
              {feel === "ios" ? <Share className="text-primary size-5" aria-hidden="true" /> : null}
            </AppWindowTitleBar>
            <AppWindowContent className="grid content-start gap-3 p-4">
              <p className="text-sm">Hiring, launch dates and the budget review.</p>
              <div className="flex gap-2">
                <Button size="sm">Share</Button>
                <Button size="sm" variant="outline">
                  Export
                </Button>
              </div>
            </AppWindowContent>
          </AppWindow>
          <figcaption className="text-muted-foreground text-center text-xs">{label}</figcaption>
        </figure>
      ))}
    </div>
  )
}
