import { ogImage, ogSize } from "@/lib/og"

export const alt = "Ballmac UI: React components your AI agent can install"
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return ogImage({
    eyebrow: "shadcn registry · MCP",
    title: "Mac-grade components for the web.",
    subtitle: "Docks, windows, globes, beams and AI interfaces. Free, accessible, one command away.",
  })
}
