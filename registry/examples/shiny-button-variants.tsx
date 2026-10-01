import { ShinyButton } from "@/components/ballmac/shiny-button"

export default function ShinyButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ShinyButton>Default</ShinyButton>
      <ShinyButton variant="secondary">Secondary</ShinyButton>
      <ShinyButton variant="outline">Outline</ShinyButton>
      <ShinyButton shape="pill">Pill</ShinyButton>
    </div>
  )
}
