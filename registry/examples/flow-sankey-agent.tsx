"use client"

import { FlowSankey } from "@/components/ballmac/flow-sankey"

export default function FlowSankeyAgent() {
  return (
    <div className="w-full max-w-3xl">
      <FlowSankey
        nodes={[
          { id: "runs", label: "Runs", group: "Start" },
          { id: "ok", label: "No approval needed", group: "Path" },
          { id: "ask", label: "Asked a person", group: "Path" },
          { id: "done", label: "Finished", group: "Outcome" },
          { id: "denied", label: "Denied", group: "Outcome" },
          { id: "failed", label: "Failed", group: "Outcome" },
        ]}
        links={[
          { source: "runs", target: "ok", value: 812 },
          { source: "runs", target: "ask", value: 238 },
          { source: "ok", target: "done", value: 741 },
          { source: "ok", target: "failed", value: 71 },
          { source: "ask", target: "done", value: 160 },
          { source: "ask", target: "denied", value: 64 },
          { source: "ask", target: "failed", value: 14 },
        ]}
        format={(v) => `${v} runs`}
      />
    </div>
  )
}