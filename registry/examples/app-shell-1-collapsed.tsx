"use client"

import { BookOpen, GitBranch, Rocket, Terminal } from "lucide-react"

import { AppShell1 } from "@/components/ballmac/blocks/app-shell-1/app-shell-1"

export default function AppShell1Collapsed() {
  return (
    <AppShell1
      workspace="Northwind"
      workspaces={["Northwind", "Fjord Labs"]}
      user={{ name: "Amara Singh", email: "amara@northwind.dev" }}
      defaultCollapsed
      height="34rem"
      nav={[
        {
          label: "Build",
          items: [
            { id: "deploys", label: "Deploys", icon: <Rocket />, badge: "2" },
            { id: "branches", label: "Branches", icon: <GitBranch /> },
            { id: "logs", label: "Logs", icon: <Terminal /> },
          ],
        },
        { label: "Learn", items: [{ id: "docs", label: "Docs", icon: <BookOpen /> }] },
      ]}
    >
      {(page) => (
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">{page.label}</h1>
          <p className="text-muted-foreground mt-2 text-sm">This page is rendered by your children function. Press Ctrl or ⌘ plus K to jump somewhere else.</p>
        </div>
      )}
    </AppShell1>
  )
}
