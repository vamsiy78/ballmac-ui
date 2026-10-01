// Ballmac UI: Orbit template route. https://ui.ballmac.com/templates/template-orbit
import type { Metadata } from "next"

import { OrbitHome } from "@/components/ballmac/templates/orbit/orbit-home"

export const metadata: Metadata = {
  title: "Orbit: Agents that finish the job",
  description: "Build, test and run AI agents with tools, evals and guardrails.",
}

export default function Page() {
  return <OrbitHome />
}
