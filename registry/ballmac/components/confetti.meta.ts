import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "confetti",
  type: "registry:ui",
  title: "Confetti",
  description:
    "Confetti in your theme colors: fireConfetti(), a useConfetti() hook that fires from an element, and a ConfettiButton. Presets for burst, side cannons, stars and fireworks; nothing fires under reduced motion.",
  category: "motion",
  tags: ["confetti", "celebration", "success", "canvas", "button", "motion"],
  files: [{ path: "components/confetti.tsx" }],
  dependencies: ["canvas-confetti@^1.9.3", "class-variance-authority"],
  devDependencies: ["@types/canvas-confetti"],
  registryDependencies: ["shadcn:utils", "button", "color"],
  examples: [
    { name: "confetti-demo", title: "Deploy success", file: "confetti-demo.tsx" },
    { name: "confetti-presets", title: "Presets", file: "confetti-presets.tsx" },
  ],
  ai: {
    summary:
      "Call fireConfetti({ preset, colors, element }) from an event handler, or useConfetti().fireFrom(buttonRef.current) after an async success. <ConfettiButton options={{ preset: \"stars\" }}> is a Ballmac button that bursts from itself on click. Colors default to --chart-1…5.",
    whenToUse: [
      "Rewarding a finished milestone: first deploy, upgrade, completed onboarding",
      "Success states after a long async action",
      "Playful marketing buttons (sparingly)",
    ],
    whenNotToUse: [
      "Routine actions such as saving a form (use a toast or inline check)",
      "As the only success signal; always show a text confirmation too",
    ],
    composesWith: ["button", "number-ticker"],
    customization: [
      "preset: burst | sides | stars | fireworks",
      "colors: theme variables (\"--chart-2\") or CSS colors",
      "Any canvas-confetti option (particleCount, spread, scalar, ticks…) passes through",
      "ConfettiButton takes the button variants (variant, size, shape)",
      "Reduced motion: fireConfetti resolves immediately without drawing",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
