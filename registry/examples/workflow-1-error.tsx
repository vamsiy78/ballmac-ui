"use client"

import { Workflow1 } from "@/components/ballmac/blocks/workflow-1/workflow-1"

export default function Workflow1Error() {
  return <Workflow1 state="error" onRetry={() => {}} />
}
