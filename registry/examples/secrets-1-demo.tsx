"use client"

import { Secrets1 } from "@/components/ballmac/blocks/secrets-1/secrets-1"

export default function Secrets1Demo() {
  return <Secrets1 onRotate={() => new Promise((r) => setTimeout(r, 500))} />
}
