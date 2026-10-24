import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "prompt-diff",
  type: "registry:ui",
  title: "Prompt Diff",
  description:
    "Two versions of a prompt compared word by word: removed words struck through and added words underlined so colour is never the only cue, a count of each, {{variables}} marked, side by side or inline, and an optional Restore button.",
  category: "ai",
  tags: ["ai", "prompt", "diff", "versions", "compare", "history", "text", "evals"],
  files: [{ path: "components/prompt-diff.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "prompt-diff-demo", title: "A system prompt, two versions", file: "prompt-diff-demo.tsx" },
    { name: "prompt-diff-inline", title: "Inline, with restore", file: "prompt-diff-inline.tsx" },
  ],
  ai: {
    summary:
      "before and after are the two texts; beforeLabel / afterLabel name them; mode is 'split' (default) or 'unified'; onRestore adds a 'Restore <before label>' button. Exports diffWords(before, after) returning [{ type: 'same' | 'add' | 'del', text }]. Compares words and keeps spacing; inputs over 200,000 word pairs are shown as fully replaced.",
    whenToUse: ["Reviewing what changed between two prompt versions before shipping or rolling back", "Any short text where the exact words changed matter"],
    whenNotToUse: ["Code or files; use diff-viewer", "Comparing model outputs side by side; use parallel-attempts"],
    composesWith: ["parallel-attempts", "run-ledger", "heat-grid", "diff-viewer"],
    a11y: [
      { keys: "Screen readers", action: "Changes are read as '[removed: old words]' and '[added: new words]'; the counts are a polite live region" },
      { keys: "Colour", action: "Removed words are struck through and added words underlined, so the difference never depends on colour" },
      { keys: "Tab, Enter / Space", action: "The view switch is two toggle buttons (aria-pressed); Restore is a real button" },
    ],
    customization: ["mode and the labels", "onRestore", "diffWords is exported"],
  },
  statesNone: "A presentational comparison: you pass the two texts in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
