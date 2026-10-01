import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-muse",
  type: "registry:block",
  title: "Muse: AI chat app",
  description:
    "A calm, reading-first AI chat app in five pages: a chat with reasoning, sources, a document panel and a model picker, a new-chat screen, projects, a library of everything made, and settings.",
  category: "templates",
  templateKind: "application",
  templatePages: [
    { title: "Chat", example: "template-muse-demo", path: "/muse" },
    { title: "New chat", example: "template-muse-new", path: "/muse/new" },
    { title: "Projects", example: "template-muse-projects", path: "/muse/projects" },
    { title: "Library", example: "template-muse-library", path: "/muse/library" },
    { title: "Settings", example: "template-muse-settings", path: "/muse/settings" },
  ],
  fonts: ["DM Sans", "Source Serif 4"],
  featured: true,
  tags: ["template", "ai", "chat", "assistant", "projects", "library", "settings", "artifacts"],
  files: [
    { path: "components/templates/muse/muse-fonts.ts" },
    { path: "components/templates/muse/muse-data.ts" },
    { path: "components/templates/muse/muse-theme.tsx" },
    { path: "components/templates/muse/muse-chat.tsx" },
    { path: "components/templates/muse/muse-projects.tsx" },
    { path: "components/templates/muse/muse-library.tsx" },
    { path: "components/templates/muse/muse-settings.tsx" },
    { path: "app/muse/page.tsx" },
    { path: "app/muse/new/page.tsx" },
    { path: "app/muse/projects/page.tsx" },
    { path: "app/muse/library/page.tsx" },
    { path: "app/muse/settings/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "ai-chat", "ai-message", "artifact-panel", "citation", "copy-button", "dialog", "model-picker", "prompt-input", "reasoning-disclosure", "segmented-control", "sheet", "slider", "streaming-text", "suggestion-chips", "switch", "thinking-indicator"],
  examples: [
    { name: "template-muse-demo", title: "Chat", file: "template-muse-demo.tsx" },
    { name: "template-muse-new", title: "New chat", file: "template-muse-new.tsx" },
    { name: "template-muse-projects", title: "Projects", file: "template-muse-projects.tsx" },
    { name: "template-muse-library", title: "Library", file: "template-muse-library.tsx" },
    { name: "template-muse-settings", title: "Settings", file: "template-muse-settings.tsx" },
  ],
  docs: "Pages are at /muse, /muse/new, /muse/projects, /muse/library and /muse/settings. Connect your model in MuseChat's send(): it currently streams a scripted reply from muse-data.ts.",
  ai: {
    summary:
      "Installs a five-page AI chat product with a serif reading column. Replace send() in muse-chat.tsx with your model call, muse-data.ts with your history, and edit museCss for the palette.",
    whenToUse: ["Chat assistants and copilots that need a full product UI", "Reading-heavy AI tools where answers are long"],
    whenNotToUse: ["Embedding a small chat widget in another page (use ai-chat-1)"],
    composesWith: ["ai-chat-2", "settings-1", "login-2"],
    a11y: [
      { keys: "Enter", action: "Sends the message; Shift+Enter adds a new line" },
      { keys: "Arrow keys in the model picker", action: "Moves through models; Enter chooses one" },
    ],
    customization: ["Replace send() with your model call", "Edit museCss for the light and dark palettes", "Swap the reading font in muse-fonts.ts"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
