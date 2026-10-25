"use client"

import { SplitBar } from "@/components/ballmac/split-bar"

export default function SplitBarDemo() {
  return (
    <div className="w-full max-w-lg">
      <SplitBar
        title="Where the spend goes"
        total="$15,760"
        format={(v) => `$${v.toLocaleString("en-US")}`}
        segments={[
          { id: "compute", label: "Compute", value: 6120 },
          { id: "models", label: "Model calls", value: 4320 },
          { id: "db", label: "Databases", value: 2380 },
          { id: "cdn", label: "CDN", value: 1120 },
          { id: "logs", label: "Logs", value: 1450 },
          { id: "other", label: "Other", value: 370 },
        ]}
      />
    </div>
  )
}
