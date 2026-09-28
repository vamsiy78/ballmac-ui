import { ArrowRight } from "lucide-react"

import { MagneticButton } from "@/components/ballmac/magnetic-button"

export default function MagneticButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-8">
      <MagneticButton size="lg" shape="pill">
        Start building <ArrowRight />
      </MagneticButton>
      <MagneticButton size="lg" shape="pill" variant="outline" strength={0.15}>
        Read the docs
      </MagneticButton>
    </div>
  )
}
