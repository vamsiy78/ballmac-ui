"use client"

import * as React from "react"
import { Calculator, CalendarDays, FileText, Folder, Moon, Music2, Presentation, SquarePen, SquareTerminal, StickyNote, Table } from "lucide-react"

import {
  SpotlightSearch,
  SpotlightSearchEmpty,
  SpotlightSearchFooter,
  SpotlightSearchGroup,
  SpotlightSearchInput,
  SpotlightSearchItem,
  SpotlightSearchList,
} from "@/components/ballmac/spotlight-search"

const app = "text-white shadow-[inset_0_0_0_0.5px_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.2)]"

export default function SpotlightSearchDemo() {
  const [opened, setOpened] = React.useState<string | null>(null)
  const open = (name: string) => () => setOpened(name)

  return (
    <div className="relative isolate flex h-[440px] w-full max-w-[640px] justify-center overflow-hidden rounded-2xl border border-foreground/10 px-3 pt-8 sm:px-8 sm:pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-1 via-chart-4 to-chart-5" />
        <div className="absolute -inset-x-1/4 top-1/2 h-full rounded-[50%] bg-white/20 blur-2xl" />
      </div>

      <SpotlightSearch label="Spotlight" className="h-fit max-w-[560px]">
        <SpotlightSearchInput autoFocus={false} />
        <SpotlightSearchList className="max-h-[300px]">
          <SpotlightSearchEmpty>No results</SpotlightSearchEmpty>
          <SpotlightSearchGroup heading="Top Hit">
            <SpotlightSearchItem icon={<StickyNote />} iconClassName={`${app} bg-linear-to-b from-chart-3/80 to-chart-3`} detail="Application" onSelect={open("Notes")}>
              Notes
            </SpotlightSearchItem>
          </SpotlightSearchGroup>
          <SpotlightSearchGroup heading="Applications">
            <SpotlightSearchItem icon={<CalendarDays />} iconClassName="bg-white text-destructive" detail="Application" onSelect={open("Calendar")}>
              Calendar
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<SquareTerminal />} iconClassName={`${app} bg-black/85`} detail="Application" onSelect={open("Terminal")}>
              Terminal
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<Music2 />} iconClassName={`${app} bg-linear-to-b from-chart-5 to-chart-4`} detail="Application" onSelect={open("Music")}>
              Music
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<Calculator />} iconClassName={`${app} bg-linear-to-b from-muted-foreground/70 to-muted-foreground`} detail="Application" onSelect={open("Calculator")}>
              Calculator
            </SpotlightSearchItem>
          </SpotlightSearchGroup>
          <SpotlightSearchGroup heading="Documents">
            <SpotlightSearchItem icon={<Presentation />} iconClassName={`${app} bg-linear-to-b from-chart-1/80 to-chart-1`} detail="Launch · Keynote" onSelect={open("Q4 Launch Plan")}>
              Q4 Launch Plan
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<Table />} iconClassName={`${app} bg-linear-to-b from-chart-2/80 to-chart-2`} detail="Finance · Sheet" onSelect={open("Pricing Model")}>
              Pricing Model
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<FileText />} detail="Brand · PDF" onSelect={open("Brand Guidelines")}>
              Brand Guidelines
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<Folder className="text-chart-1" fill="currentColor" fillOpacity={0.25} />} detail="Folder" onSelect={open("Screenshots")}>
              Screenshots
            </SpotlightSearchItem>
          </SpotlightSearchGroup>
          <SpotlightSearchGroup heading="Actions">
            <SpotlightSearchItem icon={<SquarePen />} detail="⌘N" onSelect={open("New Note")}>
              New Note
            </SpotlightSearchItem>
            <SpotlightSearchItem icon={<Moon />} detail="⇧⌘D" keywords={["theme", "appearance"]} onSelect={open("Dark Mode")}>
              Toggle Dark Mode
            </SpotlightSearchItem>
          </SpotlightSearchGroup>
        </SpotlightSearchList>
        <SpotlightSearchFooter>
          <span aria-live="polite" className="min-w-0 flex-1 truncate">
            {opened ? `Opening ${opened}…` : "Type to search apps, documents and actions"}
          </span>
          <span className="shrink-0 max-sm:hidden">↵ Open</span>
          <span className="shrink-0 max-sm:hidden">⌘↵ Show in Folder</span>
        </SpotlightSearchFooter>
      </SpotlightSearch>
    </div>
  )
}
