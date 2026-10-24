"use client"

import * as React from "react"

import { PermissionGrid, type Decision, type Permission, type PermissionPreset } from "@/components/ballmac/permission-grid"

const permissions: Permission[] = [
  { id: "read", group: "Files", label: "Read files", description: "Open any file in the project", risk: "low" },
  { id: "edit", group: "Files", label: "Edit files", description: "Change or create files in the project", risk: "medium" },
  { id: "delete", group: "Files", label: "Delete files", description: "Remove files and folders", risk: "high" },
  { id: "shell", group: "Commands", label: "Run shell commands", description: "Anything you could type in a terminal", risk: "high" },
  { id: "tests", group: "Commands", label: "Run the test suite", description: "Only the commands in package.json", risk: "low" },
  { id: "web", group: "Network", label: "Browse the web", description: "Fetch pages to read", risk: "medium" },
]

const presets: PermissionPreset[] = [
  { id: "cautious", label: "Cautious", values: { read: "allow", edit: "ask", delete: "deny", shell: "deny", tests: "ask", web: "ask" } },
  { id: "balanced", label: "Balanced", values: { read: "allow", edit: "allow", delete: "ask", shell: "ask", tests: "allow", web: "ask" } },
  { id: "hands-off", label: "Hands-off", values: { read: "allow", edit: "allow", delete: "ask", shell: "allow", tests: "allow", web: "allow" } },
]

export default function PermissionGridDemo() {
  const [value, setValue] = React.useState<Record<string, Decision>>(presets[1].values)
  return (
    <div className="w-full max-w-2xl">
      <PermissionGrid permissions={permissions} presets={presets} value={value} onValueChange={setValue} />
    </div>
  )
}
