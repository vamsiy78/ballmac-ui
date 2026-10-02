import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "prompt-input",
  type: "registry:ui",
  title: "Prompt Input",
  description:
    "An auto-growing chat input: Enter sends, Shift+Enter adds a line (IME-safe), the send button turns into Stop while streaming, with file attachment chips and a toolbar slot.",
  category: "ai",
  tags: ["ai", "chat", "input", "textarea", "composer", "attachments", "llm"],
  files: [{ path: "components/prompt-input.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["button", "shadcn:utils", "i18n"],
  examples: [
    { name: "prompt-input-demo", title: "Default", file: "prompt-input-demo.tsx" },
    { name: "prompt-input-attachments", title: "With attachments", file: "prompt-input-attachments.tsx" },
  ],
  ai: {
    summary:
      "The message composer for chat UIs. <PromptInput onSubmit={(text, files) => …} status onStop> renders a textarea, attachment chips and a send button by default; compose PromptInputTextarea, PromptInputAttachments, PromptInputToolbar, PromptInputAttachButton and PromptInputSubmit for custom layouts.",
    whenToUse: [
      "The input at the bottom of an AI chat",
      "A 'describe what you want' box that sends to a model and can be stopped mid-response",
      "Composer that needs a model picker or other controls next to the send button",
    ],
    whenNotToUse: [
      "Plain multi-line form fields (use textarea)",
      "Search boxes with results as you type (use an input or command menu)",
    ],
    composesWith: ["ai-chat", "ai-message"],
    a11y: [
      { keys: "Enter", action: "Sends the message (ignored while an IME composition is active)" },
      { keys: "Shift + Enter", action: "Inserts a new line" },
      { keys: "Tab", action: "Moves to the attach button, toolbar controls and send/stop" },
    ],
    customization: [
      "value/onValueChange for controlled text (clear it yourself in onSubmit) or defaultValue for uncontrolled (clears itself)",
      "files/onFilesChange for controlled attachments; nothing is uploaded — send the File objects wherever you need",
      "status: idle | streaming. With the AI SDK map status 'submitted' and 'streaming' to 'streaming'",
      "PromptInputTextarea maxHeight (px, default 200) caps the auto-grow",
      "PromptInputAttachButton accept and multiple mirror <input type=file>",
      "usePromptInput() exposes { value, setValue, files, submit, status } to custom toolbar controls",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
