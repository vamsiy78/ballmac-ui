import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "mention-input",
  type: "registry:ui",
  title: "Mention Input",
  description:
    "A text field where typing @ or # opens a list of people, channels or tags: highlighted mentions that know their id, async search, arrow-key choosing, whole-mention backspace and a combobox pattern for screen readers.",
  category: "forms",
  tags: ["mention", "at-mention", "autocomplete", "tags", "textarea", "comments", "combobox"],
  files: [{ path: "components/mention-input.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "direction"],
  examples: [
    { name: "mention-input-demo", title: "People and channels", file: "mention-input-demo.tsx" },
    { name: "mention-input-async", title: "Search as you type", file: "mention-input-async.tsx" },
    { name: "mention-input-single", title: "Single line with tags", file: "mention-input-single.tsx" },
    { name: "mention-input-invalid", title: "Invalid and disabled choices", file: "mention-input-invalid.tsx" },
  ],
  statesNone: "Nothing loads on its own: an async source shows a Searching row in the list while it answers, and a No matches row when it finds nothing.",
  ai: {
    summary:
      "Hold { text, mentions } in state: <MentionInput value onValueChange sources={[{ trigger: \"@\", options }]} />. options is an array or a function (query, signal) returning options or a promise. mentionsToMarkup and parseMentionMarkup convert to a string.",
    whenToUse: [
      "Comments, chat and ticket replies where people are mentioned",
      "Tag or channel pickers inside a sentence",
      "Anywhere you need to know which entity a name in the text referred to",
    ],
    whenNotToUse: [
      "Formatting text as well as mentions; use rich-text-editor",
      "Choosing one value from a list; use combobox",
      "Plain multi-line text; use textarea",
    ],
    composesWith: ["textarea", "avatar", "rich-text-editor"],
    a11y: [
      { keys: "Type @ or #", action: "Opens the list under the caret; the field is a combobox with aria-activedescendant" },
      { keys: "Arrow Up / Arrow Down", action: "Choose a suggestion; disabled ones are skipped" },
      { keys: "Enter / Tab", action: "Insert the highlighted suggestion" },
      { keys: "Escape", action: "Close the list without inserting" },
      { keys: "Backspace after a mention", action: "Removes the whole mention" },
      { keys: "Screen readers", action: "The count of suggestions and the highlighted one are announced; Searching and No matches are announced too" },
    ],
    customization: [
      "sources: trigger, options, label, className for each kind of mention",
      "minRows and maxRows, or singleLine",
      "invalid, disabled and the usual textarea props",
      "onSubmit for Enter in a single line or Ctrl/Cmd+Enter",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
