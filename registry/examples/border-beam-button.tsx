import { Sparkles } from "lucide-react"

import { BorderBeam } from "@/components/ballmac/border-beam"
import { Button } from "@/components/ballmac/button"

export default function BorderBeamButton() {
  return (
    <Button variant="outline" size="lg" shape="pill">
      <Sparkles /> Generate summary
      <BorderBeam size={48} duration={4} />
    </Button>
  )
}
