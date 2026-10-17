"use client"

import { Desktop4 } from "@/components/ballmac/blocks/desktop-4/desktop-4"

export default function Desktop4Activated() {
  return <Desktop4 feel="macos" licence={{ licensedTo: "jordan@acme.com", plan: "Pro" }} onDeactivate={() => {}} />
}
