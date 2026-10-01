// Ballmac UI: Auth Kit template route. https://ui.ballmac.com/templates/template-auth-kit
import type { Metadata } from "next"

import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Welcome back. Sign in to continue.",
}

export default function Page() {
  return <AuthKitPage page="sign-in" />
}
