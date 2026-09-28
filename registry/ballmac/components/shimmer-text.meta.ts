import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "shimmer-text",
  type: "registry:ui",
  title: "Shimmer Text",
  description:
    "Text with a band of light sweeping across it, from muted to full foreground color. Suited to AI \"thinking\" and loading status lines; static under reduced motion.",
  category: "motion",
  tags: ["text", "loading", "ai", "status", "shimmer", "motion"],
  files: [{ path: "components/shimmer-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [{ name: "shimmer-text-demo", title: "Thinking status", file: "shimmer-text-demo.tsx" }],
  ai: {
    summary:
      "Wrap short text: <ShimmerText>Thinking…</ShimmerText>. The base color is --muted-foreground, so the text stays readable at every frame; the sweep brightens it to --foreground. In forced-colors mode it falls back to plain system text.",
    whenToUse: [
      "An AI assistant's \"Thinking…\" or \"Searching the docs…\" line while a response streams",
      "Inline pending states such as \"Deploying…\" or \"Indexing 1,204 files\"",
      "A subtle accent on a short marketing label",
    ],
    whenNotToUse: [
      "Paragraphs or long text (the sweep becomes distracting)",
      "The only signal that something is loading; pair it with aria-live or a spinner's label for screen readers",
    ],
    composesWith: ["text-reveal", "border-beam"],
    customization: [
      "duration: seconds per sweep (default 2)",
      "spread: highlight half-width in em (default 2)",
      "as: span | p | div | h1–h4; size and weight via className",
      "Colors come from --muted-foreground and --foreground; override backgroundImage via style for other tokens",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
