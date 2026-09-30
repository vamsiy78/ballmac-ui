"use client";
import { BarChart3, FolderKanban, Home, Inbox, Settings, Users } from "lucide-react";
import {
  AppShell,
  AppShellAside,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  AppShellSidebarTrigger,
  AppShellSkipLink,
} from "@/components/ballmac/app-shell";
const nav = [
  { label: "Overview", icon: Home, active: true },
  { label: "Projects", icon: FolderKanban },
  { label: "Inbox", icon: Inbox },
  { label: "Team", icon: Users },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];
function NavList() {
  return (
    <ul className="grid gap-0.5 p-3">
      {nav.map(({ label, icon: Icon, active }) => (
        <li key={label}>
          <a
            href={`#${label.toLowerCase()}`}
            aria-current={active ? "page" : undefined}
            className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
export default function AppShellDemo() {
  return (
    <AppShell role="region" tabIndex={0} aria-label="Dashboard preview" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-96 min-h-0 w-full max-w-4xl overflow-auto rounded-xl border shadow-sm">
      <AppShellSkipLink />
      <AppShellHeader>
        <AppShellSidebarTrigger />
        <span className="text-[15px] font-semibold tracking-tight">Acme</span>
        <span className="ml-auto text-xs text-muted-foreground">Q3 planning</span>
      </AppShellHeader>
      <AppShellSidebar label="Workspace" className="h-[calc(24rem-var(--app-header-h))]">
        <NavList />
      </AppShellSidebar>
      <AppShellMain>
        <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">Header and side panels stay put; the page scrolls in the middle.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["Open tasks", "Shipped this week", "Blocked", "Due soon"].map((t, i) => (
            <div key={t} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{t}</p>
              <p className="text-2xl font-semibold tabular-nums">{[24, 9, 2, 6][i]}</p>
            </div>
          ))}
        </div>
      </AppShellMain>
      <AppShellAside className="h-[calc(24rem-var(--app-header-h))]" label="Activity">
        <p className="text-sm font-medium">Activity</p>
        <ul className="mt-3 grid gap-3 text-sm text-muted-foreground">
          <li>Ana closed 3 tasks</li>
          <li>Kofi commented on Launch plan</li>
          <li>Mei joined the team</li>
        </ul>
      </AppShellAside>
      <AppShellFooter>Acme workspace · all systems normal</AppShellFooter>
    </AppShell>
  );
}
