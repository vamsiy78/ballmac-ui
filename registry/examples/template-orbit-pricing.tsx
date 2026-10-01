"use client"

import { OrbitPricing } from "@/components/ballmac/templates/orbit/orbit-pricing"

export default function TemplateOrbitPricing() {
  return (
    <OrbitPricing
      hrefs={{ home: "/preview/template-orbit-demo", pricing: "/preview/template-orbit-pricing", changelog: "/preview/template-orbit-changelog", login: "/preview/template-orbit-login" }}
    />
  )
}
