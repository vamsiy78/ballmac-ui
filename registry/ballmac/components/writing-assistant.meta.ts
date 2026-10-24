import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "writing-assistant",
  type: "registry:ui",
  title: "Writing Assistant",
  description:
    "Suggested edits shown in place: the words that could change are marked in the text with a different underline per kind, and each suggestion says what changes, why, and what the text becomes. Accept, Dismiss, Accept all, or edit it yourself.",
  category: "ai",
  tags: ["ai", "writing", "suggestions", "editor", "grammar", "tone", "diff", "assistant"],
  files: [{ path: "components/writing-assistant.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "writing-assistant-demo", title: "A draft with suggestions", file: "writing-assistant-demo.tsx" },
    { name: "writing-assistant-clean", title: "Nothing to suggest", file: "writing-assistant-clean.tsx" },
  ],
  ai: {
    summary:
      "suggestions is [{ id, find, replace, reason, kind?: grammar | clarity | tone | length }] (required); the first occurrence of find in the text is the one marked. text / defaultText / onTextChange, title, onAccept(suggestion), onDismiss(suggestion). Accept replaces the words and drops the suggestion; Accept all applies them all without the edits disturbing each other; one whose words are no longer in the text, or that overlaps an earlier one, is left out. Exports segmentText.",
    whenToUse: ["An AI proofreading or rewriting pass over a short piece of text", "Any place where a model proposes small edits a person should approve one by one"],
    whenNotToUse: ["A full rich-text editor; use rich-text-editor", "Comparing two prompts word by word; use prompt-diff"],
    composesWith: ["prompt-diff", "message-actions", "ai-chat", "review-center"],
    a11y: [
      { keys: "Marks", action: "Each marked phrase is a button named 'Suggestion, <kind>: <words>' with pressed state; the kind is also shown by the underline style (wavy, dotted, dashed, double), never colour alone" },
      { keys: "Changes", action: "Each card reads as words: 'Remove: …' and 'Use instead: …'; Accept and Dismiss name the words they affect" },
      { keys: "Announcements", action: "Accepting, dismissing and Accept all are announced in a polite live region" },
      { keys: "Editing", action: "A labelled textarea; suggestions pause while editing and say so" },
    ],
    customization: ["text and suggestions", "title", "onAccept, onDismiss, onTextChange"],
  },
  statesNone: "A presentational editor: the text and the suggestions are passed in, so it has nothing of its own to load. With no suggestions it says the text reads well.",
  version: "1.0.0",
  updated: "2026-10-25",
})
