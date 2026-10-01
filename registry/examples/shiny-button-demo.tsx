import { ShinyButton } from "@/components/ballmac/shiny-button"

export default function ShinyButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <ShinyButton size="lg">Hover for shine</ShinyButton>
      <ShinyButton size="lg" shine="loop">
        Always inviting
      </ShinyButton>
    </div>
  )
}
