import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "file-dropzone",
  type: "registry:ui",
  title: "File Dropzone",
  description:
    "Drop files or browse with native file selection, type and size validation, removable file rows, and live errors.",
  category: "forms",
  tags: ["upload", "files", "dropzone"],
  files: [{ path: "components/file-dropzone.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "file-dropzone-demo",
      title: "Overview",
      file: "file-dropzone-demo.tsx",
    },
    {
      name: "file-dropzone-states",
      title: "States and variants",
      file: "file-dropzone-states.tsx",
    },
  ],
  ai: {
    summary:
      "Drop files or browse with native file selection, type and size validation, removable file rows, and live errors.",
    whenToUse: [
      "Upload a document or group of assets",
      "Review selected files before submitting",
    ],
    whenNotToUse: ["Use input for a minimal single-file field"],
    composesWith: ["button"],
    a11y: [
      { keys: "Tab / Enter", action: "Opens the native file chooser" },
      { keys: "Drop", action: "Adds valid files" },
      { keys: "Tab / Enter", action: "Removes a selected file" },
    ],
    customization: [
      "accept, maxFiles, maxSize, multiple",
      "files / defaultFiles and onFilesChange",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
