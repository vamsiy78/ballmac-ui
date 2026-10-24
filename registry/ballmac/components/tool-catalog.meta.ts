import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tool-catalog",
  type: "registry:ui",
  title: "Tool Catalog",
  description:
    "Everything an agent can call, with a switch for each: what it does, how risky it is, how often it is used and fails, its input schema one click away, search and filters, and a warning when a high-risk tool is on.",
  category: "ai",
  tags: ["ai", "agents", "tools", "mcp", "function calling", "permissions", "catalog", "settings"],
  files: [{ path: "components/tool-catalog.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "match-highlight", "switch"],
  examples: [
    { name: "tool-catalog-demo", title: "An assistant's tools", file: "tool-catalog-demo.tsx" },
    { name: "tool-catalog-failing", title: "A switch that fails", file: "tool-catalog-failing.tsx" },
  ],
  ai: {
    summary:
      "tools is [{ id, name, description, enabled, risk?: low | medium | high, calls?, errorRate?: 0..1, latencyMs?, schema?: JSON text }]. onToggle(tool, enabled) may return a promise; reject and the switch goes back with the message. Filters: All, On, Off, Needs attention (error rate of 5% or more, or a high-risk tool that is on). Exports needsAttention.",
    whenToUse: ["Letting people turn an agent's tools on and off and see how each behaves", "A settings page for an MCP server's tools"],
    whenNotToUse: ["Allow, ask or deny per tool; use permission-grid", "One level of freedom; use autonomy-dial"],
    composesWith: ["permission-grid", "autonomy-dial", "tool-call-card", "agent-graph"],
    a11y: [
      { keys: "Tab, Space", action: "Each switch is named '<tool> is on'; filters are toggle buttons with counts" },
      { keys: "Enter / Space on Input schema", action: "Opens the schema (aria-expanded); it is a focusable, labelled region that stays left to right" },
      { keys: "Failures", action: "A failed switch is an alert beside the tool and the switch goes back" },
      { keys: "Risk and failure rate", action: "Written as words ('High risk', 'fails often'), never colour alone" },
    ],
    customization: ["tools and their stats", "title", "onToggle"],
  },
  statesNone: "A control with no data of its own: it shows the tools you pass in and reports the changes, and it has its own no-match message.",
  version: "1.0.0",
  updated: "2026-10-24",
})
