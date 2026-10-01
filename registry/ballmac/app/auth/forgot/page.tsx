// Ballmac UI: Auth Kit template route. https://ui.ballmac.com/templates/template-auth-kit
import type { Metadata } from "next"

import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export const metadata: Metadata = {
  title: "Forgot your password?",
  description: "Get a link to choose a new password.",
}

export default function Page() {
  return <AuthKitPage page="forgot" />
}
