import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "emoji-picker",
  type: "registry:ui",
  title: "Emoji Picker",
  description:
    "An emoji picker that loads its data on first use: search by name or word, jump between groups, pick a skin tone, recent emoji, a real ARIA grid with arrow keys, and any language from Emojibase.",
  category: "forms",
  tags: ["emoji", "picker", "reactions", "chat", "search", "skin tone", "grid"],
  files: [{ path: "components/emoji-picker.tsx" }],
  dependencies: ["emojibase-data@^18", "lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "i18n", "direction"],
  examples: [
    { name: "emoji-picker-demo", title: "Picker", file: "emoji-picker-demo.tsx" },
    { name: "emoji-picker-popover", title: "In a popover, inserting into text", file: "emoji-picker-popover.tsx" },
    { name: "emoji-picker-german", title: "German", file: "emoji-picker-german.tsx" },
    { name: "emoji-picker-loading", title: "Loading", file: "emoji-picker-loading.tsx" },
    { name: "emoji-picker-error", title: "Could not load", file: "emoji-picker-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "emoji-picker-loading", trigger: "while the emoji data loads", note: "A grid of skeletons under a disabled search box, announced as loading. The data is fetched the first time the picker is shown." },
    { id: "error", title: "Could not load", example: "emoji-picker-error", trigger: "loadEmojis rejects", note: "An error with a Try again button that loads the emoji again, announced as an alert." },
  ],
  ai: {
    summary:
      "<EmojiPicker onSelect={(e) => insert(e.emoji)} />. It loads English emoji on first use. For another language pass loadEmojis that returns fromEmojibase(compact, groups) for that language. Wrap it in a popover for a button.",
    whenToUse: [
      "Chat, comments and reactions where people add emoji",
      "A reaction bar's \"more\" menu",
      "Any text field that needs an emoji button",
    ],
    whenNotToUse: [
      "A fixed handful of reactions; show buttons instead",
      "Inserting images or stickers",
      "Custom emoji sets; map them into the same EmojiData and pass loadEmojis",
    ],
    composesWith: ["popover", "textarea", "mention-input", "rich-text-editor"],
    a11y: [
      { keys: "Tab", action: "Search, group buttons, the grid (one tab stop) and the skin tones are separate stops" },
      { keys: "Arrow keys", action: "Move across the grid and into the next group; left and right swap in right-to-left" },
      { keys: "Home / End / Ctrl+Home / Ctrl+End", action: "Start and end of the row, and of the whole grid" },
      { keys: "Enter / Space", action: "Choose the emoji" },
      { keys: "Arrow Down in search", action: "Moves to the first result" },
      { keys: "Screen readers", action: "Each emoji is a button named in the picker's language; results found and the chosen emoji are announced" },
    ],
    customization: [
      "columns, height, autoFocus",
      "skinTone and onSkinToneChange to hold the tone yourself",
      "recent and storageKey, or recent={false}",
      "loadEmojis for another language or your own emoji",
    ],
  },
  source: {
    name: "Emojibase",
    url: "https://github.com/milesj/emojibase",
    license: "MIT",
    copyright: "Copyright (c) 2017-2019 Miles Johnson",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
