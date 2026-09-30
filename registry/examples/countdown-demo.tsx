import { Countdown } from "@/components/ballmac/countdown"
export default function CountdownDemo() {
  return (
    <div className="bg-card flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border border-border p-5">
      <p className="text-sm font-medium">Your session closes in</p>
      <Countdown defaultValue={600} label="Session remaining" />
      <p className="text-muted-foreground text-xs">
        Save your work before the timer ends.
      </p>
    </div>
  )
}
