import { StatusDot } from "@/components/ballmac/status-dot"
export default function StatusDotStates() {
  return (
    <div className="bg-card grid w-full max-w-xs gap-3 rounded-xl border border-border p-4">
      <StatusDot label="Available" status="online" />
      <StatusDot label="In a meeting" status="busy" />
      <StatusDot label="Away" status="away" />
      <StatusDot label="Offline" status="offline" />
    </div>
  )
}
