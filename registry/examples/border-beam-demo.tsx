import { BorderBeam } from "@/components/ballmac/border-beam"

export default function BorderBeamDemo() {
  return (
    <div className="relative w-full max-w-sm rounded-xl border bg-card p-6 text-card-foreground">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">deploy · main</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-ring" aria-hidden="true" />
          Building
        </span>
      </div>
      <p className="mt-4 text-base font-semibold tracking-tight">Rolling out to 3 regions</p>
      <p className="mt-1 text-sm text-muted-foreground">Step 2 of 4: running migrations on the primary database.</p>
      <BorderBeam />
    </div>
  )
}
