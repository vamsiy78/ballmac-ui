import type { MetadataRoute } from "next"

// Lets phones and browsers name and style the site when it is saved to a home screen. The icons are the same files the tab uses.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ballmac UI",
    short_name: "Ballmac UI",
    description: "Accessible React and Tailwind components, blocks and templates you install with the shadcn CLI or your AI agent.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }
}
