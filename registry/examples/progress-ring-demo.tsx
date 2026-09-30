import { ProgressRing } from "@/components/ballmac/progress-ring"
export default function ProgressRingDemo() {
  return (
    <div className="flex w-full max-w-xs items-center gap-5 rounded-xl border border-border bg-card p-5">
      <ProgressRing label="Onboarding complete" value={72} />
      <div>
        <p className="text-sm font-semibold">Almost ready</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Complete your workspace setup.
        </p>
      </div>
    </div>
  )
}
