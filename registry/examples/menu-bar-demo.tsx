"use client"

import { BatteryFull, Command, Search, SlidersHorizontal, Wifi } from "lucide-react"

import {
  MenuBar,
  MenuBarCheckboxItem,
  MenuBarClock,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarSeparator,
  MenuBarShortcut,
  MenuBarStatus,
  MenuBarStatusItem,
  MenuBarSub,
  MenuBarSubContent,
  MenuBarSubTrigger,
  MenuBarTrigger,
} from "@/components/ballmac/menu-bar"

export default function MenuBarDemo() {
  return (
    <div className="relative isolate h-[320px] w-full max-w-[640px] overflow-hidden rounded-2xl border border-foreground/10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dark:brightness-[0.55]">
        <div className="absolute inset-0 bg-linear-to-br from-chart-2 via-chart-1 to-chart-4" />
        <div className="absolute -inset-x-1/4 top-1/2 h-full rounded-[50%] bg-white/20 blur-2xl" />
      </div>

      <MenuBar>
        <MenuBarMenu value="acme">
          <MenuBarTrigger aria-label="Acme menu" className="px-2.5">
            <Command aria-hidden="true" />
          </MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>About This Mac</MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>System Settings…</MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>
              Lock Screen <MenuBarShortcut>⌃⌘Q</MenuBarShortcut>
            </MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="notes">
          <MenuBarTrigger variant="app">Notes</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>About Notes</MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>
              Settings… <MenuBarShortcut>⌘,</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>
              Hide Notes <MenuBarShortcut>⌘H</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem>
              Quit Notes <MenuBarShortcut>⌘Q</MenuBarShortcut>
            </MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="file">
          <MenuBarTrigger>File</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>
              New Note <MenuBarShortcut>⌘N</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem>
              New Folder <MenuBarShortcut>⇧⌘N</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarSeparator />
            <MenuBarSub>
              <MenuBarSubTrigger>Share</MenuBarSubTrigger>
              <MenuBarSubContent portal={false}>
                <MenuBarItem>Copy Link</MenuBarItem>
                <MenuBarItem>Mail</MenuBarItem>
                <MenuBarItem>Messages</MenuBarItem>
              </MenuBarSubContent>
            </MenuBarSub>
            <MenuBarItem>
              Export as PDF… <MenuBarShortcut>⌥⌘E</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem>
              Pin Note <MenuBarShortcut>⇧⌘P</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>
              Close <MenuBarShortcut>⌘W</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem disabled>
              Print… <MenuBarShortcut>⌘P</MenuBarShortcut>
            </MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="edit">
          <MenuBarTrigger>Edit</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>
              Undo <MenuBarShortcut>⌘Z</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem>
              Redo <MenuBarShortcut>⇧⌘Z</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem>
              Cut <MenuBarShortcut>⌘X</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem>
              Copy <MenuBarShortcut>⌘C</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem>
              Paste <MenuBarShortcut>⌘V</MenuBarShortcut>
            </MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="view">
          <MenuBarTrigger className="max-sm:hidden">View</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarCheckboxItem checked>Show Folders</MenuBarCheckboxItem>
            <MenuBarCheckboxItem>Show Note Count</MenuBarCheckboxItem>
            <MenuBarSeparator />
            <MenuBarItem inset>
              Zoom In <MenuBarShortcut>⌘+</MenuBarShortcut>
            </MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="window">
          <MenuBarTrigger className="max-md:hidden">Window</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>
              Minimize <MenuBarShortcut>⌘M</MenuBarShortcut>
            </MenuBarItem>
            <MenuBarItem>Zoom</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu value="help">
          <MenuBarTrigger className="max-md:hidden">Help</MenuBarTrigger>
          <MenuBarContent portal={false}>
            <MenuBarItem>Notes Help</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>

        <MenuBarStatus>
          <MenuBarStatusItem aria-label="Battery, 100 percent" className="max-sm:hidden">
            <BatteryFull aria-hidden="true" />
          </MenuBarStatusItem>
          <MenuBarStatusItem aria-label="Wi-Fi, connected">
            <Wifi aria-hidden="true" />
          </MenuBarStatusItem>
          <MenuBarStatusItem aria-label="Spotlight" className="max-sm:hidden">
            <Search aria-hidden="true" />
          </MenuBarStatusItem>
          <MenuBarStatusItem aria-label="Control Center" className="max-sm:hidden">
            <SlidersHorizontal aria-hidden="true" />
          </MenuBarStatusItem>
          <MenuBarClock className="max-sm:hidden" />
          <MenuBarClock className="sm:hidden" format={{ hour: "numeric", minute: "2-digit" }} />
        </MenuBarStatus>
      </MenuBar>
    </div>
  )
}
