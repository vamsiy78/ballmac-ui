import { Sparkline } from "@/components/ballmac/sparkline"
export default function SparklineStates() {
  return (
    <div className="grid w-full max-w-xs gap-4">
      <Sparkline values={[9, 8, 7, 6, 5, 4]} label="Declining trend" />
      <Sparkline values={[]} label="No samples" />
    </div>
  )
}
