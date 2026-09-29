import { AspectRatio } from "@/components/ballmac/aspect-ratio"
export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border bg-card shadow-sm">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 via-background to-chart-2/20">
          <div className="rounded-xl border bg-card/90 px-6 py-4 text-center shadow-sm">
            <div className="text-sm font-semibold">Quarterly overview</div>
            <div className="mt-1 text-xs text-muted-foreground">
              A clearer view of your work
            </div>
          </div>
        </div>
      </AspectRatio>
      <div className="p-4 text-sm font-medium">
        A story with room to breathe
      </div>
    </div>
  )
}
