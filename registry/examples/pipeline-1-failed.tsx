"use client"

import { Pipeline1 } from "@/components/ballmac/blocks/pipeline-1/pipeline-1"

export default function Pipeline1Failed() {
  return <Pipeline1 run={{ branch: "main", commit: "c93d1e0", message: "Move the retry into the shared helper", author: "Theo Nakamura", stages: [{ id: "build", name: "Build", status: "passed", duration: "1 min 40 s" }, { id: "test", name: "Tests", status: "failed", duration: "1 min 55 s", log: ["$ pnpm test", "FAIL  export.test.ts", "  expected 3 retries, received 2", "Tests  1 failed | 611 passed (612)"] }, { id: "stage", name: "Deploy to staging", status: "skipped" }, { id: "prod", name: "Deploy to production", status: "skipped" }] }} defaultOpenId="test" onRerun={() => new Promise((r) => setTimeout(r, 500))} />
}
