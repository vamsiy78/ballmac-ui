import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ai-orb",
  type: "registry:ui",
  title: "AI Orb",
  description:
    "A glass orb of drifting theme-colored light that shows whether the assistant is idle, listening, thinking or speaking, and swells with a live voice level.",
  category: "ai",
  tags: ["ai", "orb", "voice", "assistant", "status", "visual"],
  files: [{ path: "components/ai-orb.tsx" }],
  dependencies: ["motion@^12", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "ai-orb-demo", title: "Four states", file: "ai-orb-demo.tsx" },
    { name: "ai-orb-voice", title: "Reacting to voice level", file: "ai-orb-voice.tsx" },
  ],
  ai: {
    summary:
      "state is idle | listening | thinking | speaking. Pass level (0 to 1) to make it swell with audio. size is sm | default | lg | xl. Colors come from chart-1 to chart-5, so it follows the theme.",
    whenToUse: ["The face of a voice assistant or a full-screen chat", "A status mark beside an assistant's name"],
    whenNotToUse: ["A plain spinner (use spinner)", "Anything that must be readable as text; pair it with thinking-indicator"],
    composesWith: ["voice-input", "thinking-indicator", "ai-chat"],
    a11y: [
      { keys: "Screen readers", action: "role=img named 'Assistant is listening' and so on. Pass label={null} to hide it when text beside it says the same" },
      { keys: "Reduced motion", action: "Static orb, no drift or breathing" },
    ],
    customization: ["state", "level", "size", "label (string | null)"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
