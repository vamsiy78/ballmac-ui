import { Sparkles } from "lucide-react"

import { ShimmerText } from "@/components/ballmac/shimmer-text"

export default function ShimmerTextDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-center gap-2 text-sm" role="status" aria-live="polite">
        <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
        <ShimmerText className="font-medium">Thinking…</ShimmerText>
      </div>
      <p className="mt-2 pl-6 font-mono text-xs text-muted-foreground">Reading 3 files in src/billing</p>
    </div>
  )
}
