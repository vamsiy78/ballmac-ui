import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "text-animate",
  type: "registry:ui",
  title: "Text Animate",
  description:
    "Reveals text by character, word or line with eight entrances (fade, blur, slide, scale, rotate), staggered and triggered on scroll, with the full text kept for screen readers.",
  category: "text",
  tags: ["text", "animation", "reveal", "stagger", "headline"],
  files: [{ path: "components/text-animate.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "text-animate-demo", title: "Headline by word", file: "text-animate-demo.tsx" },
    { name: "text-animate-characters", title: "By character, five entrances", file: "text-animate-characters.tsx" },
  ],
  ai: {
    summary:
      "<TextAnimate by='word|character|line' animation='blurIn|fadeIn|slideUp|slideDown|slideLeft|slideRight|scaleUp|rotateIn'>Text</TextAnimate>. Newlines make lines. as picks the element.",
    whenToUse: ["Headlines and short statements that should make an entrance", "Section titles revealed on scroll"],
    whenNotToUse: ["Paragraphs of body text", "Text that changes often (use word-rotate or typing-text)"],
    composesWith: ["blur-fade", "gradient-text", "text-reveal"],
    a11y: [
      { keys: "Screen readers", action: "The full text is in a hidden element; animated pieces are aria-hidden" },
      { keys: "Reduced motion", action: "Text is shown immediately" },
    ],
    customization: ["by", "animation", "stagger and duration", "inView and once", "as"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
