import { PartyPopper, Sparkles, Star, Zap } from "lucide-react"

import { ConfettiButton } from "@/components/ballmac/confetti"

export default function ConfettiPresets() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ConfettiButton>
        <PartyPopper aria-hidden="true" />
        Burst
      </ConfettiButton>
      <ConfettiButton variant="outline" options={{ preset: "sides" }}>
        <Zap aria-hidden="true" />
        Side cannons
      </ConfettiButton>
      <ConfettiButton variant="outline" options={{ preset: "stars", colors: ["--chart-3", "--chart-5"] }}>
        <Star aria-hidden="true" />
        Stars
      </ConfettiButton>
      <ConfettiButton variant="outline" options={{ preset: "fireworks" }}>
        <Sparkles aria-hidden="true" />
        Fireworks
      </ConfettiButton>
    </div>
  )
}
