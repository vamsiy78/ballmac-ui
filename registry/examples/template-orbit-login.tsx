"use client"

import { OrbitLogin } from "@/components/ballmac/templates/orbit/orbit-login"

export default function TemplateOrbitLogin() {
  return (
    <OrbitLogin
      hrefs={{ home: "/preview/template-orbit-demo", pricing: "/preview/template-orbit-pricing", changelog: "/preview/template-orbit-changelog", login: "/preview/template-orbit-login" }}
    />
  )
}
