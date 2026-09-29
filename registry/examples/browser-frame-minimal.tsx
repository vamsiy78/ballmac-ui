import { BrowserFrame } from "@/components/ballmac/browser-frame"

export default function BrowserFrameMinimal() {
  return (
    <BrowserFrame url="acme.com/changelog" className="max-w-md">
      <div className="space-y-4 p-6">
        <p className="font-mono text-xs text-muted-foreground">Sep 29, 2026</p>
        <h2 className="text-xl font-semibold tracking-tight">Branch previews, now 2× faster</h2>
        <p className="text-sm text-muted-foreground">
          Builds reuse the dependency cache from main, so most previews are ready before review starts.
        </p>
        <div className="h-24 rounded-lg border bg-[linear-gradient(135deg,color-mix(in_oklch,var(--chart-2)_22%,transparent),color-mix(in_oklch,var(--chart-1)_22%,transparent))]" />
      </div>
    </BrowserFrame>
  )
}
