"use client"

import { OrbitHome } from "@/components/ballmac/templates/orbit/orbit-home"

export default function TemplateOrbitDemo() {
  return (
    <OrbitHome
      hrefs={{ home: "/preview/template-orbit-demo", pricing: "/preview/template-orbit-pricing", changelog: "/preview/template-orbit-changelog", login: "/preview/template-orbit-login" }}
    />
  )
}
