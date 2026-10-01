// Ballmac UI: Launch template route. https://ui.ballmac.com/templates/template-launch
import type { Metadata } from "next"

import { LaunchContact } from "@/components/ballmac/templates/launch/launch-contact"

export const metadata: Metadata = {
  title: "Contact · Beacon",
  description: "Talk to a person about plans, security or migrating.",
}

export default function Page() {
  return <LaunchContact />
}
