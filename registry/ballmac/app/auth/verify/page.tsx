// Ballmac UI: Auth Kit template route. https://ui.ballmac.com/templates/template-auth-kit
import type { Metadata } from "next"

import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Enter the 6-digit code we sent you.",
}

export default function Page() {
  return <AuthKitPage page="verify" />
}
