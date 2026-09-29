import { Separator } from "@/components/ballmac/separator"
export default function SeparatorStates() {
  return (
    <div className="flex w-full max-w-sm items-center gap-4 rounded-xl border bg-card p-5 text-sm">
      <span>Overview</span>
      <Separator orientation="vertical" className="h-5" />
      <span>Activity</span>
      <Separator orientation="vertical" className="h-5" />
      <span>Settings</span>
    </div>
  )
}
