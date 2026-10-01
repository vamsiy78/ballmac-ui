// Ballmac UI: Auth Kit template route. https://ui.ballmac.com/templates/template-auth-kit
import type { Metadata } from "next"

import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Pick a password you haven't used before.",
}

export default function Page() {
  return <AuthKitPage page="reset" />
}
