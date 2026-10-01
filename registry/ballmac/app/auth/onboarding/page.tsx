// Ballmac UI: Auth Kit template route. https://ui.ballmac.com/templates/template-auth-kit
import type { Metadata } from "next"

import { AuthKitPage } from "@/components/ballmac/templates/auth-kit/auth-kit-pages"

export const metadata: Metadata = {
  title: "Set up your workspace",
  description: "Three short steps to get started.",
}

export default function Page() {
  return <AuthKitPage page="onboarding" />
}
