import { ArrowDown } from "lucide-react"

import { SpinningText } from "@/components/ballmac/spinning-text"

export default function SpinningTextDemo() {
  return (
    <SpinningText text="Scroll to explore the library" className="size-44">
      <span className="flex size-12 items-center justify-center rounded-full bg-foreground text-background">
        <ArrowDown aria-hidden="true" className="size-5" />
      </span>
    </SpinningText>
  )
}
