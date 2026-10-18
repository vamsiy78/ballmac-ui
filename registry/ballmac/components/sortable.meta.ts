import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "sortable",
  type: "registry:ui",
  title: "Sortable",
  description:
    "Reorder lists, grids and multi-column boards by pointer, touch or keyboard, with spoken announcements, move buttons for people who cannot drag, a floating lifted item and reduced motion.",
  category: "primitives",
  tags: ["drag", "drop", "reorder", "sortable", "dnd", "kanban", "keyboard"],
  files: [{ path: "components/sortable.tsx" }],
  dependencies: ["@dnd-kit/core@^6", "@dnd-kit/sortable@^10", "@dnd-kit/utilities@^3", "motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "direction"],
  examples: [
    { name: "sortable-demo", title: "Playlist", file: "sortable-demo.tsx" },
    { name: "sortable-grid", title: "Dashboard grid", file: "sortable-grid.tsx" },
    { name: "sortable-horizontal", title: "Horizontal chips", file: "sortable-horizontal.tsx" },
    { name: "sortable-board", title: "Board with columns", file: "sortable-board.tsx" },
    { name: "sortable-buttons", title: "With move buttons", file: "sortable-buttons.tsx" },
  ],
  statesNone: "Nothing loads or fails: it reorders the items it is given; an empty list or group simply draws no items.",
  ai: {
    summary:
      "Hold the order in state: <Sortable label value={ids} onValueChange={setIds}> with a <SortableItem id> per id, each holding a <SortableHandle>. SortableGroups and SortableGroup move items between lists.",
    whenToUse: [
      "Playlists, checklists, filters and settings people put in their own order",
      "Dashboard tiles in a grid and chips in a row",
      "Boards where cards move between columns",
    ],
    whenNotToUse: [
      "A full kanban product with cards, tags and assignees; use kanban-board",
      "Sorting by a column's value; use data-table or data-grid",
      "Reordering rows of a huge virtualized list",
    ],
    composesWith: ["button", "badge", "kanban-board"],
    a11y: [
      { keys: "Space / Enter on the handle", action: "Picks up the item; the same keys drop it" },
      { keys: "Arrow keys", action: "Move the lifted item; the new position is announced" },
      { keys: "Escape", action: "Cancels and puts the item back" },
      { keys: "SortableMove buttons", action: "Move an item one place with a click, for people who cannot drag (WCAG 2.5.7)" },
      { keys: "Screen readers", action: "Instructions, picked-up, over, dropped and cancelled messages are read out, in the page's language" },
    ],
    customization: [
      "orientation: vertical | horizontal | grid",
      "dragEverywhere on an item to drag by its whole body instead of a handle",
      "overlay={false} to keep the lifted item in place",
      "getLabel and getGroupLabel for spoken names",
      "className on the list, the group and each item",
    ],
  },
  source: {
    name: "dnd-kit",
    url: "https://github.com/clauderic/dnd-kit",
    license: "MIT",
    copyright: "Copyright (c) 2021, Claudéric Demers",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
