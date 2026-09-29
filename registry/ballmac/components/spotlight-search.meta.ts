import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "spotlight-search",
  type: "registry:ui",
  title: "Spotlight Search",
  description:
    "A macOS Spotlight-style command palette on cmdk: a large translucent search field, grouped results with app-icon tiles, fuzzy filtering and arrow-key navigation, inline or as a ⌘K dialog.",
  category: "macos",
  tags: ["command palette", "search", "spotlight", "cmdk", "macos", "⌘k", "launcher", "keyboard"],
  files: [{ path: "components/spotlight-search.tsx" }],
  dependencies: ["cmdk@^1", "radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "spotlight-search-demo", title: "Spotlight", file: "spotlight-search-demo.tsx" },
    { name: "spotlight-search-dialog", title: "⌘K dialog", file: "spotlight-search-dialog.tsx" },
  ],
  ai: {
    summary:
      "Inline: <SpotlightSearch><SpotlightSearchInput /><SpotlightSearchList><SpotlightSearchEmpty/><SpotlightSearchGroup heading><SpotlightSearchItem icon iconClassName detail onSelect>Title</SpotlightSearchItem></SpotlightSearchGroup></SpotlightSearchList></SpotlightSearch>. Overlay: swap the root for <SpotlightSearchDialog open onOpenChange hotkey=\"k\">. Root props are cmdk Command props (filter, shouldFilter, value).",
    whenToUse: [
      "A ⌘K command palette for navigation and actions in an app or docs site",
      "A Mac-style launcher in a product hero or desktop mockup",
      "Searching a mixed list of apps, documents and commands with keyboard-first navigation",
    ],
    whenNotToUse: [
      "A plain search field for a results page (use input)",
      "Choosing one value in a form (use select or a combobox)",
    ],
    composesWith: ["menu-bar", "mac-window", "dock"],
    a11y: [
      { keys: "⌘K / Ctrl+K", action: "Opens and closes SpotlightSearchDialog (hotkey prop; false disables)" },
      { keys: "ArrowUp / ArrowDown", action: "Moves the highlighted result, wrapping at the ends" },
      { keys: "Enter", action: "Runs the highlighted item's onSelect" },
      { keys: "Escape", action: "Closes the dialog and returns focus to where it was" },
    ],
    customization: [
      "SpotlightSearchItem: icon + iconClassName (tile color), detail (kind, path or shortcut), keywords for extra matches",
      "SpotlightSearchInput: placeholder (default Spotlight Search), trailing slot",
      "SpotlightSearchFooter for key hints; SpotlightSearchSeparator between groups",
      "The highlight uses --ring, like the macOS accent color",
      "useSpotlightHotkey(callback, key) for your own trigger",
    ],
  },
  version: "1.0.1",
  updated: "2026-09-29",
})
