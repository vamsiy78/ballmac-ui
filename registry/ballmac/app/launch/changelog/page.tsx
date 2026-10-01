// Ballmac UI: Launch template route. https://ui.ballmac.com/templates/template-launch
import type { Metadata } from "next"

import { LaunchChangelog } from "@/components/ballmac/templates/launch/launch-changelog"

export const metadata: Metadata = {
  title: "Changelog · Beacon",
  description: "Every release, newest first.",
}

export default function Page() {
  return <LaunchChangelog />
}
