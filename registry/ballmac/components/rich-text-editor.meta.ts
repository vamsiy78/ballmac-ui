import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "rich-text-editor",
  type: "registry:ui",
  title: "Rich Text Editor",
  description:
    "A rich text editor on Tiptap: headings, bold, lists, checklists, quotes, code and links, with a toolbar you drive by keyboard, a slash menu for blocks, a link popover, a character limit and HTML output.",
  category: "forms",
  tags: ["editor", "wysiwyg", "rich text", "tiptap", "markdown", "slash menu", "comments"],
  files: [{ path: "components/rich-text-editor.tsx" }],
  dependencies: ["@tiptap/core@^3", "@tiptap/react@^3", "@tiptap/pm@^3", "@tiptap/starter-kit@^3", "@tiptap/extensions@^3", "@tiptap/extension-list@^3", "@tiptap/extension-text-align@^3", "@tiptap/suggestion@^3", "lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "popover", "skeleton", "state-view", "i18n", "direction"],
  examples: [
    { name: "rich-text-editor-demo", title: "Release notes", file: "rich-text-editor-demo.tsx" },
    { name: "rich-text-editor-minimal", title: "Comment box with a limit", file: "rich-text-editor-minimal.tsx" },
    { name: "rich-text-editor-form", title: "In a form", file: "rich-text-editor-form.tsx" },
    { name: "rich-text-editor-checklist", title: "Checklist", file: "rich-text-editor-checklist.tsx" },
    { name: "rich-text-editor-disabled", title: "Disabled", file: "rich-text-editor-disabled.tsx" },
    { name: "rich-text-editor-loading", title: "Loading", file: "rich-text-editor-loading.tsx" },
    { name: "rich-text-editor-error", title: "Could not load", file: "rich-text-editor-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "rich-text-editor-loading", trigger: "state=\"loading\"", note: "A toolbar and lines drawn as skeletons, announced as loading, for content that is still being fetched." },
    { id: "error", title: "Could not load", example: "rich-text-editor-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
    { id: "disabled", title: "Disabled", example: "rich-text-editor-disabled", trigger: "disabled", note: "The content stays readable and selectable; the toolbar and typing are off and the editor says it is disabled." },
  ],
  ai: {
    summary:
      "Hold the HTML in state: <RichTextEditor label value={html} onChange={setHtml} />. Pick tools with features, add characterLimit and showCount, and mark invalid with description. Sanitize the HTML before you store or show it.",
    whenToUse: [
      "Comments, descriptions, notes and release notes people format",
      "Content that is stored as HTML and shown elsewhere",
      "Forms that need a labelled, validated, accessible editor",
    ],
    whenNotToUse: [
      "Plain multi-line text; use textarea",
      "Code editing with syntax highlighting; use a code editor",
      "Real-time collaboration, comments in the margin or tables out of the box; build on the Tiptap editor from editorRef",
    ],
    composesWith: ["button", "popover", "label", "field"],
    a11y: [
      { keys: "Tab", action: "The toolbar is one tab stop, and the editor is the next; Escape then Tab leaves the editor" },
      { keys: "Arrow keys / Home / End (toolbar)", action: "Move between tools; they swap in right-to-left" },
      { keys: "Ctrl or Cmd + B, I, U, K", action: "Bold, italic, underline and the link popover; markdown shortcuts like ## and - work as you type" },
      { keys: "/", action: "Opens the block menu; Up and Down choose, Enter inserts, Escape closes, and the highlighted block is announced" },
      { keys: "Screen readers", action: "The editor is a labelled multiline textbox; tools are toggle buttons with aria-pressed; invalid and disabled are set on the textbox" },
    ],
    customization: [
      "features: heading, bold, italic, underline, strike, code, link, bulletList, orderedList, taskList, blockquote, codeBlock, horizontalRule, align, undo, slash",
      "characterLimit, showCount, minHeight, maxHeight",
      "invalid with description for the hint and the error",
      "editorRef for the Tiptap editor, to add extensions or commands",
    ],
  },
  source: {
    name: "Tiptap",
    url: "https://github.com/ueberdosis/tiptap",
    license: "MIT",
    copyright: "Copyright (c) 2025, Tiptap GmbH",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
