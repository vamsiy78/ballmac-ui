import { ToolCallCard } from "@/components/ballmac/tool-call-card"

export default function ToolCallCardStates() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <ToolCallCard name="read_file" status="pending" input={{ path: "src/app/page.tsx" }} />
      <ToolCallCard name="run_tests" status="running" input={{ pattern: "checkout" }} />
      <ToolCallCard name="list_items" status="success" duration={214} input={{ kind: "block" }} result="12 blocks" />
      <ToolCallCard name="deploy_preview" status="error" duration={3120} input={{ branch: "preprod" }} result="Build failed: missing environment variable" />
    </div>
  )
}
