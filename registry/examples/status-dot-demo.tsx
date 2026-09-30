import { StatusDot } from "@/components/ballmac/status-dot"
export default function StatusDotDemo() {
  return (
    <div className="bg-card flex w-full max-w-xs items-center justify-between rounded-xl border border-border px-4 py-3">
      <span className="text-sm font-medium">Workspace sync</span>
      <StatusDot label="All systems online" status="online" pulse />
    </div>
  )
}
