import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "sparkles-text",
  type: "registry:ui",
  title: "Sparkles Text",
  description:
    "Text with four-point stars that twinkle around it in theme colors, re-rolling position each time, with an optional gradient fill.",
  category: "text",
  tags: ["text", "sparkle", "stars", "twinkle", "marketing"],
  files: [{ path: "components/sparkles-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "sparkles-text-demo", title: "Headline with sparkles", file: "sparkles-text-demo.tsx" },
    { name: "sparkles-text-gradient", title: "Gradient fill", file: "sparkles-text-gradient.tsx" },
  ],
  ai: {
    summary:
      "<SparklesText count gradient>Text</SparklesText>. Sparkles are decorative and positioned after mount, so the server markup stays identical.",
    whenToUse: ["One standout word in a marketing headline", "Celebratory states such as a new plan or achievement"],
    whenNotToUse: ["Dense UI", "More than one or two per screen"],
    composesWith: ["gradient-text", "confetti", "shimmer-text"],
    a11y: [
      { keys: "Screen readers", action: "Sparkles are aria-hidden and pointer-events-none; the text is untouched" },
      { keys: "Reduced motion", action: "No sparkles are drawn" },
    ],
    customization: ["count", "gradient", "className for size and weight"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
