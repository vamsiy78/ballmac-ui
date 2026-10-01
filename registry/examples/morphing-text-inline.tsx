import { MorphingText } from "@/components/ballmac/morphing-text"

export default function MorphingTextInline() {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-3 text-3xl font-semibold tracking-tight text-foreground">
      <span>Made for</span>
      <MorphingText className="h-12 min-w-40 text-3xl" hold={1200} texts={["designers", "founders", "engineers", "everyone"]} />
    </p>
  )
}
