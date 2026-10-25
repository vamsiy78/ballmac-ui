"use client"

import { Hero8 } from "@/components/ballmac/blocks/hero-8/hero-8"

export default function Hero8Fails() {
  return <Hero8 onSubmit={() => Promise.reject(new Error("That address is already on the list."))} />
}
