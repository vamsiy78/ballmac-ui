// Ballmac UI: Auth Kit template route. https://ui.ballmac.com/templates/template-auth-kit
import type { Metadata } from "next"

import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export const metadata: Metadata = {
  title: "Accept your invitation",
  description: "Join your team's workspace.",
}

export default function Page() {
  return <AuthKitPage page="invite" />
}
