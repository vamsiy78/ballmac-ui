import { ProgressRing } from "@/components/ballmac/progress-ring"
export default function ProgressRingStates() {
  return (
    <div className="flex w-full max-w-xs items-center justify-around gap-4">
      <ProgressRing label="Upload complete" value={100} size={72} />
      <ProgressRing label="Sync progress" value={3} max={10} size={72} />
    </div>
  )
}
