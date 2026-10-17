import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-7",
  type: "registry:block",
  title: "Agent 7: agent builder",
  description:
    "An agent builder: instructions and model, each tool set to off, ask first or allowed, the knowledge it may read, guardrails, and a live preview that changes with every setting. Publishing shows submitting, success and error.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "builder", "no-code", "tools", "permissions", "knowledge", "guardrails", "instructions", "publish", "preview"],
  files: [{ path: "components/blocks/agent-7/agent-7.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "approval-card", "badge", "blur-fade", "button", "cover-art", "model-picker", "segmented-control", "skeleton", "state-view", "switch", "textarea", "tool-call-card", "use-resource"],
  examples: [
    { name: "agent-7-demo", title: "Default", file: "agent-7-demo.tsx" },
    { name: "agent-7-bare", title: "A new agent, no tools", file: "agent-7-bare.tsx" },
    { name: "agent-7-loading", title: "Loading", file: "agent-7-loading.tsx" },
    { name: "agent-7-publishing", title: "Publishing", file: "agent-7-publishing.tsx" },
    { name: "agent-7-published", title: "Published", file: "agent-7-published.tsx" },
    { name: "agent-7-error", title: "Could not publish", file: "agent-7-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-7-loading", trigger: "state=\"loading\"", note: "A skeleton of the settings and the preview under the real header." },
    { id: "submitting", title: "Publishing", example: "agent-7-publishing", trigger: "state=\"submitting\"", note: "Publish shows a spinner and \"Publishing…\" and is disabled; the status reads Publishing…" },
    { id: "success", title: "Published", example: "agent-7-published", trigger: "state=\"success\"", note: "The button and status say Published until something changes again." },
    { id: "error", title: "Could not publish", example: "agent-7-error", trigger: "state=\"error\"", note: "An alert says the changes are kept and why it failed (errorState sets the copy or throw an Error from onPublish)." },
  ],
  ai: {
    summary:
      "An agent configuration page. <Agent7 tools={[{ id, name, description, icon, writes }]} sources={[{ id, name, kind, status: 'ready' | 'syncing' | 'failed', synced }]} models={ModelOption[]} defaultConfig={{ name, instructions, model, tools: { [id]: 'off' | 'ask' | 'allow' }, sources: [ids], askBeforeExternal, maxSteps }} onChange onPublish={async (config) => …} onAddSource onRemoveSource />. The preview shows the first enabled tool: behind an approval card when set to Ask first, as a finished tool call when Allowed.",
    whenToUse: ["Letting people create or edit an AI agent in a no-code way", "An internal admin page for configuring an agent's tools, knowledge and limits"],
    whenNotToUse: ["Chatting with an agent (use ai-chat-1)", "Approving an agent's actions as it works (use agent-1 or agent-2)", "Choosing a model only (use model-picker)"],
    composesWith: ["agent-2", "agent-3", "agent-6", "app-shell-1"],
    a11y: [
      { keys: "Tab", action: "Each tool and source has a switch named for it; a tool's permission is a radio group that appears when it is on" },
      { keys: "Publish with missing fields", action: "The name and instructions are marked invalid and their reasons are announced as alerts" },
      { keys: "Status", action: "Draft, Unpublished changes, Publishing… and Published are a status region" },
    ],
    customization: [
      "maxInstructions, sampleRequest (the text of the request in the preview)",
      "state: \"submitting\" | \"success\" | \"error\" to drive publishing yourself; leave it out and the block runs it",
      "Tools marked writes default to Ask first when turned on; map the permission to your agent runtime's approval setting",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
