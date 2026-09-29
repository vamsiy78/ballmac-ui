"use client"

import * as React from "react"
import { CalendarDays, Search, Settings, SquarePen, SquareTerminal, User } from "lucide-react"

import {
  SpotlightSearchDialog,
  SpotlightSearchEmpty,
  SpotlightSearchGroup,
  SpotlightSearchInput,
  SpotlightSearchItem,
  SpotlightSearchList,
} from "@/components/ballmac/spotlight-search"

export default function SpotlightSearchDialogExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-64 items-center gap-2 rounded-full border bg-background px-3.5 text-sm text-muted-foreground shadow-xs outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="font-sans text-xs">⌘K</kbd>
      </button>
      <SpotlightSearchDialog open={open} onOpenChange={setOpen}>
        <SpotlightSearchInput placeholder="Search or jump to…" />
        <SpotlightSearchList>
          <SpotlightSearchEmpty>No results</SpotlightSearchEmpty>
          <SpotlightSearchGroup heading="Go to">
            <SpotlightSearchItem icon={<CalendarDays />} detail="G then C" onSelect={() => setOpen(false)}>
              Calendar
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<User />} detail="G then P" onSelect={() => setOpen(false)}>
              Profile
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<Settings />} detail="⌘," onSelect={() => setOpen(false)}>
              Settings
            </SpotlightSearchItem>
          </SpotlightSearchGroup>
          <SpotlightSearchGroup heading="Actions">
            <SpotlightSearchItem icon={<SquarePen />} detail="⌘N" onSelect={() => setOpen(false)}>
              New document
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<SquareTerminal />} detail="⌃`" onSelect={() => setOpen(false)}>
              Open terminal
            </SpotlightSearchItem>
          </SpotlightSearchGroup>
        </SpotlightSearchList>
      </SpotlightSearchDialog>
    </>
  )
}
