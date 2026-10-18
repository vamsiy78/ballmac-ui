import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "editor-1",
  type: "registry:block",
  title: "Editor 1: Markdown with live preview",
  description:
    "A Markdown editor with live preview: a toolbar and shortcuts that wrap the selection, a preview built from safe elements, word count and reading time, and autosave that says Saved, Saving, Unsaved changes or Not saved with Retry.",
  category: "blocks",
  blockCategory: "editor",
  tags: ["editor", "markdown", "writing", "notes", "preview", "autosave", "text editor", "docs", "wysiwyg", "composer"],
  files: [{ path: "components/blocks/editor-1/editor-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "editor-1-demo", title: "Write and preview", file: "editor-1-demo.tsx" },
    { name: "editor-1-preview", title: "Preview tab (phones)", file: "editor-1-preview.tsx" },
    { name: "editor-1-failed", title: "Saving fails", file: "editor-1-failed.tsx" },
    { name: "editor-1-loading", title: "Loading", file: "editor-1-loading.tsx" },
    { name: "editor-1-error", title: "Could not load", file: "editor-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "editor-1-loading", trigger: "state=\"loading\"", note: "A skeleton toolbar and page under the real heading, announced as loading." },
    { id: "error", title: "Could not load", example: "editor-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A save that fails shows Not saved with Retry and keeps the text." },
  ],
  ai: {
    summary:
      "A Markdown editor. <Editor1 title defaultValue autosaveMs={1200} onSave={(value) => Promise} onChange={(value) => ...} defaultTab='write' | 'preview' />. Supports headings (1 to 3), bold, italic, inline code, links (http, https, mailto only), bulleted and numbered lists, quotes and rules. Ctrl or Command with B, I, K format and S saves now. Saving happens autosaveMs after the last keystroke; reject onSave to show Not saved with Retry. The preview never uses dangerouslySetInnerHTML.",
    whenToUse: ["Notes, docs, release notes and posts written in Markdown", "A comment or message composer that needs formatting"],
    whenNotToUse: ["A full rich text editor with tables and images", "A short single-line field (use input)"],
    composesWith: ["app-shell-1", "tickets-1", "changelog-1", "help-1"],
    a11y: [
      { keys: "Tab, Ctrl or Command + B / I / K / S", action: "The toolbar buttons say their shortcut in their name; the writing field has its own label; S saves right away" },
      { keys: "Saving", action: "The status line is a live region: Saved, Saving, Unsaved changes, or Not saved with a Retry button" },
      { keys: "Preview", action: "A labelled region updated as you type; on narrow screens a Write and Preview tablist switches between the two" },
    ],
    customization: ["The writing field uses dir=auto, so Arabic and Hebrew text flow the right way as you type", "Formatting marks wrap the selection, or a placeholder that is selected so typing replaces it", "Reading time assumes 220 words a minute"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
