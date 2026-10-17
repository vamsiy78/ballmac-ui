import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "upload-1",
  type: "registry:block",
  title: "Upload 1: upload manager",
  description:
    "An upload manager: a drop area that reacts to dragging, validation that explains each rejection, and a list where every file has its own state (waiting, uploading with progress, finishing, done, or failed with a reason and retry).",
  category: "blocks",
  blockCategory: "upload",
  tags: ["upload", "files", "drag and drop", "dropzone", "progress", "retry", "validation", "attachments", "images", "multi-file"],
  files: [{ path: "components/blocks/upload-1/upload-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "media", "skeleton", "state-view"],
  examples: [
    { name: "upload-1-demo", title: "Files in every state", file: "upload-1-demo.tsx" },
    { name: "upload-1-empty", title: "Nothing yet", file: "upload-1-empty.tsx" },
    { name: "upload-1-loading", title: "Loading", file: "upload-1-loading.tsx" },
    { name: "upload-1-error", title: "Uploads unavailable", file: "upload-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "upload-1-loading", trigger: "state=\"loading\"", note: "A skeleton of the drop area and the list under the real heading." },
    { id: "empty", title: "Nothing yet", example: "upload-1-empty", trigger: "state=\"empty\" (or defaultItems={[]})", note: "Just the drop area, which is the empty state: it says where to drop and what is accepted." },
    { id: "error", title: "Uploads unavailable", example: "upload-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry) and a drop area that is switched off, so nothing is dropped into a broken page." },
  ],
  ai: {
    summary:
      "A multi-file upload page. <Upload1 accept=\"image/*,.pdf,.csv\" acceptLabel=\"PNG, JPG, PDF or CSV\" maxSize={10_000_000} maxFiles={10} concurrency={2} onUpload={async (file, report, signal) => { /* send it; call report(0..1); throw to fail */ }} onItemsChange />. Each file is one of queued, uploading, processing, done or failed; rejected files (wrong type, too large, over the limit) are listed as failed with the reason. Without onUpload it simulates uploading.",
    whenToUse: ["Uploading several files to a project, library or ticket", "Anywhere progress per file, retry and cancel matter"],
    whenNotToUse: ["Picking one file in a form (use file-dropzone)", "Attaching a file to a chat message (use chat-attachment)", "Avatar upload (use file-dropzone with a preview)"],
    composesWith: ["app-shell-1", "billing-1", "file-dropzone"],
    a11y: [
      { keys: "Tab to Browse", action: "Opens the system file picker with Enter or Space; dropping is an addition, never the only way" },
      { keys: "Each file", action: "Has a progress bar with a name and value; completions and failures are announced politely, not every percent" },
      { keys: "Failures", action: "State the reason in words and offer Retry when the file is still available" },
    ],
    customization: [
      "accept, acceptLabel, maxSize, maxFiles, concurrency",
      "onUpload gets an AbortSignal: pass it to fetch so Cancel really stops the request; presigned S3 or R2 PUTs report progress with XMLHttpRequest",
      "defaultItems shows earlier uploads; they are display only (there is no file to retry)",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
