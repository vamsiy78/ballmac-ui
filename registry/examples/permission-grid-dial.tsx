"use client"

import * as React from "react"

import { AutonomyDial } from "@/components/ballmac/autonomy-dial"
import { PermissionGrid, type Decision, type Permission } from "@/components/ballmac/permission-grid"

const permissions: Permission[] = [
  { id: "edit", label: "Edit files", risk: "medium" },
  { id: "shell", label: "Run shell commands", risk: "high" },
  { id: "web", label: "Browse the web", risk: "medium" },
]
const byLevel: Record<string, Record<string, Decision>> = {
  suggest: { edit: "deny", shell: "deny", web: "deny" },
  ask: { edit: "ask", shell: "ask", web: "ask" },
  "auto-edit": { edit: "allow", shell: "ask", web: "ask" },
  full: { edit: "allow", shell: "allow", web: "allow" },
}

/** The dial sets the broad level; the grid lets someone fine-tune a single permission after. */
export default function PermissionGridDial() {
  const [level, setLevel] = React.useState("ask")
  const [value, setValue] = React.useState<Record<string, Decision>>(byLevel.ask)
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <AutonomyDial
        value={level}
        onValueChange={(v) => {
          setLevel(v)
          setValue(byLevel[v])
        }}
      />
      <PermissionGrid permissions={permissions} value={value} onValueChange={setValue} />
    </div>
  )
}
