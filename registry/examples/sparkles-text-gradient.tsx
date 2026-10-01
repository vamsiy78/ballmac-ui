import { SparklesText } from "@/components/ballmac/sparkles-text"

export default function SparklesTextGradient() {
  return (
    <div className="grid justify-items-center gap-3">
      <SparklesText gradient count={14} className="text-5xl font-extrabold tracking-tight">
        Level up
      </SparklesText>
      <p className="text-sm text-muted-foreground">You unlocked 3 new badges this week.</p>
    </div>
  )
}
