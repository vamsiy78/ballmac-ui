import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chat-attachment",
  type: "registry:ui",
  title: "Chat Attachment",
  description:
    "File chips and image tiles for composers and messages, with type detection, sizes, upload progress, failed-upload retry, remove and open actions, and animated list changes.",
  category: "ai",
  tags: ["ai", "chat", "attachment", "file", "upload", "image"],
  files: [{ path: "components/chat-attachment.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "chat-attachment-demo", title: "Chips with upload states", file: "chat-attachment-demo.tsx" },
    { name: "chat-attachment-tiles", title: "Image tiles", file: "chat-attachment-tiles.tsx" },
  ],
  ai: {
    summary:
      "<ChatAttachmentList> holds <ChatAttachment name size type previewUrl status progress onRemove onRetry onOpen variant='chip'|'tile'>. Kind and icon come from the MIME type or extension. Also exports formatFileSize and attachmentKind.",
    whenToUse: ["Files staged in a prompt input before sending", "Attachments shown inside a sent message"],
    whenNotToUse: ["A drag and drop upload area", "Generic file tables"],
    composesWith: ["prompt-input", "ai-message"],
    a11y: [
      { keys: "Tab", action: "Reaches open, retry and remove for each file" },
      { keys: "Enter / Space", action: "Runs the focused action" },
      { keys: "Screen readers", action: "List of attachments, buttons named 'Remove report.pdf', and a progressbar per upload" },
    ],
    customization: ["variant: chip | tile", "status: ready | uploading | error", "progress 0 to 100", "error text"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
