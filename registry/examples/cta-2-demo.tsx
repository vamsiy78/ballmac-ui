"use client"

import { Cta2 } from "@/components/ballmac/blocks/cta-2/cta-2"

export default function Cta2Demo() {
  return <Cta2 onSubmit={() => new Promise((resolve) => setTimeout(resolve, 900))} />
}
