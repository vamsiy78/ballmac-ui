"use client"

import { Ecommerce2 } from "@/components/ballmac/blocks/ecommerce-2/ecommerce-2"

export default function Ecommerce2Simple() {
  return <Ecommerce2 product={{ name: "Ember ceramic mug", price: 28, summary: "A mug that keeps coffee warm.", kind: "mug", colors: [{ id: "clay", label: "Clay", tone: 4 }, { id: "sand", label: "Sand", tone: 3 }], details: [{ title: "Care", body: "Dishwasher safe." }], highlights: ["Holds 350 ml"], counts: { 5: 20, 4: 5, 3: 1, 2: 0, 1: 0 }, reviews: [] }} />
}
