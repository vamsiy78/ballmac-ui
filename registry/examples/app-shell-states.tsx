"use client";
import { Home, Settings } from "lucide-react";
import { AppShell, AppShellFooter, AppShellHeader, AppShellMain, AppShellSidebar, AppShellSidebarTrigger } from "@/components/ballmac/app-shell";
export default function AppShellStates() {
  return (
    <AppShell headerHeight="3rem" sidebarWidth="12rem" role="region" tabIndex={0} aria-label="Compact shell preview" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-64 min-h-0 w-full max-w-2xl overflow-auto rounded-xl border">
      <AppShellHeader>
        <AppShellSidebarTrigger />
        <span className="text-sm font-semibold">Compact shell</span>
      </AppShellHeader>
      <AppShellSidebar label="Sections" className="h-[calc(16rem-3rem)]">
        <ul className="grid gap-0.5 p-2 text-sm">
          <li className="flex items-center gap-2 rounded-md bg-accent px-2 py-1.5 font-medium"><Home aria-hidden="true" className="size-4" /> Home</li>
          <li className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground"><Settings aria-hidden="true" className="size-4" /> Settings</li>
        </ul>
      </AppShellSidebar>
      <AppShellMain className="p-4 lg:p-5">
        <p className="text-sm text-muted-foreground">Narrower header and sidebar through props. Below the lg breakpoint the sidebar opens from the menu button.</p>
      </AppShellMain>
      <AppShellFooter>Footer</AppShellFooter>
    </AppShell>
  );
}
