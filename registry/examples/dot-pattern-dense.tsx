import { DotPattern } from "@/components/ballmac/dot-pattern"

export default function DotPatternDense() {
  return (
    <div className="relative isolate h-56 w-full max-w-md overflow-hidden rounded-xl border bg-card">
      <DotPattern width={10} height={10} radius={0.75} radialMask={false} className="-z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="p-6">
        <p className="text-sm font-medium">Empty inbox</p>
        <p className="mt-1 text-sm text-muted-foreground">Nothing needs your attention right now.</p>
      </div>
    </div>
  )
}
