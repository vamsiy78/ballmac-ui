// Ballmac UI: Orbit template route. https://ui.ballmac.com/templates/template-orbit
import type { Metadata } from "next"

import { OrbitLogin } from "@/components/ballmac/templates/orbit/orbit-login"

export const metadata: Metadata = {
  title: "Sign in to Orbit",
  description: "Sign in to your Orbit workspace.",
}

export default function Page() {
  return <OrbitLogin />
}
