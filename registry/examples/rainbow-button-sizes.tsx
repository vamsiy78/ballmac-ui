import { RainbowButton } from "@/components/ballmac/rainbow-button"

export default function RainbowButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <RainbowButton size="sm">Small</RainbowButton>
      <RainbowButton>Default</RainbowButton>
      <RainbowButton shape="pill" size="lg" variant="outline">
        Pill outline
      </RainbowButton>
      <RainbowButton disabled>Disabled</RainbowButton>
    </div>
  )
}
