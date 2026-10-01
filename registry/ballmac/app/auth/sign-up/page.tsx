// Ballmac UI: Auth Kit template route. https://ui.ballmac.com/templates/template-auth-kit
import type { Metadata } from "next"

import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export const metadata: Metadata = {
  title: "Create your account",
  description: "Free for 14 days. No card needed.",
}

export default function Page() {
  return <AuthKitPage page="sign-up" />
}
