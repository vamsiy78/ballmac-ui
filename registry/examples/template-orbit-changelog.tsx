"use client"

import { OrbitChangelog } from "@/components/ballmac/templates/orbit/orbit-changelog"

export default function TemplateOrbitChangelog() {
  return (
    <OrbitChangelog
      hrefs={{ home: "/preview/template-orbit-demo", pricing: "/preview/template-orbit-pricing", changelog: "/preview/template-orbit-changelog", login: "/preview/template-orbit-login" }}
    />
  )
}
