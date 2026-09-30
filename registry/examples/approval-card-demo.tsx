"use client"

import * as React from "react"

import { ApprovalCard } from "@/components/ballmac/approval-card"

export default function ApprovalCardDemo() {
  const [note, setNote] = React.useState<string>()
  return (
    <div className="w-full max-w-lg">
      <ApprovalCard
        title="Run a shell command"
        description="The assistant wants to remove build output before compiling again."
        risk="medium"
        details={[
          { label: "Directory", value: "~/projects/storefront" },
          { label: "Runs as", value: "your user" },
        ]}
        preview={<code>rm -rf .next dist &amp;&amp; pnpm build</code>}
        onApprove={() => setNote("by you")}
        onDeny={() => setNote("by you")}
        onAlwaysAllow={() => setNote("by you, and will not ask again")}
        resolvedNote={note}
        expiresIn={45}
      />
    </div>
  )
}
