import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "artifact-panel",
  type: "registry:ui",
  title: "Artifact Panel",
  description:
    "A side panel for things an assistant generates: Preview and Code tabs, version stepping, copy and download, a streaming state and a close button, with the rendered result in your own slot.",
  category: "ai",
  tags: ["ai", "artifact", "canvas", "preview", "code", "panel"],
  files: [{ path: "components/artifact-panel.tsx" }],
  dependencies: ["motion@^12", "lucide-react", "radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "artifact-panel-demo", title: "Component with code", file: "artifact-panel-demo.tsx" },
    { name: "artifact-panel-streaming", title: "Writing and versions", file: "artifact-panel-streaming.tsx" },
  ],
  ai: {
    summary:
      "title, kind, icon, code, filename, language and children as the preview. versions > 1 adds steppers (version/onVersionChange). streaming shows a progress edge and disables copy and download. onClose adds a close button.",
    whenToUse: ["Code, documents or designs a model produced next to the chat", "Anything users iterate on in versions"],
    whenNotToUse: ["Showing code in the chat; use code-block", "Generic tabs; use tabs"],
    composesWith: ["ai-chat", "code-block", "resizable"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight", action: "Switches between Preview and Code when the tabs have focus" },
      { keys: "Tab", action: "Reaches version arrows, copy, download, close, and the scrollable content" },
      { keys: "Screen readers", action: "Region named by the title; version changes are announced politely" },
    ],
    customization: ["defaultTab", "streaming", "actions slot", "previewClassName", "filename and language"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
