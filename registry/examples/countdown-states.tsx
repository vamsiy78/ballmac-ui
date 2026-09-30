import { Countdown } from "@/components/ballmac/countdown"
export default function CountdownStates() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <Countdown value={3670} running={false} label="Event starts in" />
      <Countdown value={0} running={false} label="Time remaining" />
    </div>
  )
}
