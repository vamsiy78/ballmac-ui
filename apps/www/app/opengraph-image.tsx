import { ogImage, ogSize } from "@/lib/og"

export const alt = "Ballmac UI: React components your AI agent can install"
export const size = ogSize
export const contentType = "image/png"

// Built once with the site (the Cloudflare build is static).
export const dynamic = "force-static"

export default function Image() {
  return ogImage({
    eyebrow: "shadcn registry · MCP",
    title: "Make your web app feel native.",
    subtitle: "Crafted React components with native-app motion, built-in accessibility and code you own.",
  })
}
