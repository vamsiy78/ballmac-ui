import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "snippet-tabs",
  type: "registry:ui",
  title: "Snippet Tabs",
  description:
    "Request examples in several languages with built-in highlighting, a remembered language choice shared across the page, line numbers, copy, and {{variables}} filled with real values.",
  category: "developer",
  tags: ["code", "snippet", "tabs", "api", "curl"],
  files: [{ path: "components/snippet-tabs.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils", "copy-button", "highlight", "i18n"],
  examples: [
    { name: "snippet-tabs-demo", title: "cURL, JavaScript, Python and Go", file: "snippet-tabs-demo.tsx" },
    { name: "snippet-tabs-variables", title: "With your API key filled in", file: "snippet-tabs-variables.tsx" },
  ],
  ai: {
    summary:
      "snippets is [{ label, code, language? }]. Language comes from the label (cURL, Python, Go, JavaScript). storageKey remembers the reader's pick and syncs every instance. variables replaces {{name}} in code and in what Copy puts on the clipboard.",
    whenToUse: ["API docs that show one call in several languages", "Getting-started pages where code should use the viewer's own key"],
    whenNotToUse: ["Package manager commands (install-tabs)", "One file per tab (code-block tabs)"],
    composesWith: ["install-tabs", "code-block", "api-key-field", "api-endpoint"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight", action: "Moves between languages" },
      { keys: "Tab", action: "Reaches Copy and the scrollable code, which is a named region" },
      { keys: "Screen readers", action: "Tab list named by the title; each panel is a labelled region" },
    ],
    customization: ["storageKey", "variables", "lineNumbers", "title", "bodyClassName for a max height"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
