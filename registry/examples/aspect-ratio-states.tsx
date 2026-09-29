import { AspectRatio } from "@/components/ballmac/aspect-ratio"
export default function AspectRatioStates() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      <AspectRatio ratio={1} className="rounded-xl bg-primary/10">
        <div className="flex items-center justify-center text-sm font-medium">
          1:1
        </div>
      </AspectRatio>
      <AspectRatio ratio={4 / 3} className="rounded-xl bg-chart-2/10">
        <div className="flex items-center justify-center text-sm font-medium">
          4:3
        </div>
      </AspectRatio>
    </div>
  )
}
