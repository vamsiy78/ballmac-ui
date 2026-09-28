import { ogImage, ogSize } from "@/lib/og"

export const alt = "Ballmac UI: React components your AI agent can install"
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return ogImage({
    eyebrow: "shadcn registry · MCP",
    title: "Components your AI agent can install.",
    subtitle: "Accessible React and Tailwind components, blocks and templates in one design language.",
  })
}
