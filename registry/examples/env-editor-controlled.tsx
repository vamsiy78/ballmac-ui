"use client"

import * as React from "react"

import { EnvEditor, formatEnv, type EnvVariable } from "@/components/ballmac/env-editor"

export default function EnvEditorControlled() {
  const [vars, setVars] = React.useState<EnvVariable[]>([
    { id: "1", key: "API_URL", value: "https://api.example.com" },
    { id: "2", key: "API_URL", value: "https://staging.example.com" },
    { id: "3", key: "3RD_PARTY_KEY", value: "abc" },
  ])
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <EnvEditor value={vars} onChange={setVars} maskAll={false} title="Staging variables" />
      <pre
        aria-label="Resulting .env file"
        role="region"
        tabIndex={0}
        className="max-h-32 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-5 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {formatEnv(vars) || "# empty"}
      </pre>
    </div>
  )
}
