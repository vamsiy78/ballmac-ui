import { GradientText } from "@/components/ballmac/gradient-text"

export default function GradientTextShiny() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <GradientText as="h2" variant="shiny" className="text-5xl font-bold tracking-[-0.04em]">
        Acme Plus
      </GradientText>
      <GradientText
        variant="shiny"
        colors={["var(--chart-2)", "var(--chart-1)"]}
        angle={90}
        duration={1.2}
        className="text-sm font-medium"
      >
        New every week
      </GradientText>
    </div>
  )
}
