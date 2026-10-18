import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "locations-1",
  type: "registry:block",
  title: "Locations 1: finder on a world map",
  description:
    "A locations finder on a dotted world map: pressable pins, a searchable list, filters by type, and a card for the chosen place with address, contacts, directions and whether it is open now in its own time zone.",
  category: "blocks",
  blockCategory: "locations",
  tags: ["locations", "store locator", "offices", "map", "find us", "stores", "branches", "opening hours", "contact"],
  files: [{ path: "components/blocks/locations-1/locations-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "dotted-map", "match-highlight", "skeleton", "state-view"],
  examples: [
    { name: "locations-1-demo", title: "Default", file: "locations-1-demo.tsx" },
    { name: "locations-1-night", title: "Late evening in Europe", file: "locations-1-night.tsx" },
    { name: "locations-1-loading", title: "Loading", file: "locations-1-loading.tsx" },
    { name: "locations-1-empty", title: "No locations", file: "locations-1-empty.tsx" },
    { name: "locations-1-error", title: "Could not load", file: "locations-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "locations-1-loading", trigger: "state=\"loading\"", note: "A skeleton list and map under the real heading, announced as loading." },
    { id: "empty", title: "No locations", example: "locations-1-empty", trigger: "state=\"empty\" (or places={[]})", note: "Says places appear when a shop or office opens; emptyState sets the copy. A search with no match says so with Clear." },
    { id: "error", title: "Could not load", example: "locations-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A locations finder. <Locations1 places={[{ id, name, kind: 'Office' | 'Store', city, country, address, lat, lng, utcOffset: 1, hours: { open: 9, close: 18, days: [1,2,3,4,5] }, phone, email }]} now='2026-10-19T10:42:00Z' defaultSelectedId onSelect />. Open now, closing and opening times are worked out from now, each utcOffset and hours (days default to Monday to Friday). Pass now yourself; the block never reads the clock. Pins are real buttons placed from lat and lng.",
    whenToUse: ["A contact or find-us page for a business with several offices or shops", "A store locator on a marketing site"],
    whenNotToUse: ["One address with a map embed", "Turn-by-turn routes or live traffic"],
    composesWith: ["contact-1", "footer-1", "about-1", "directory-1"],
    a11y: [
      { keys: "Tab", action: "Search, type filter, each place in the list as one button (pressed when chosen), then the pins, which are the same places as buttons with their name and city" },
      { keys: "Open now", action: "Written as 'Open now · until 18:00' or 'Closed · opens 09:00', beside a dot, never by color alone" },
      { keys: "Links", action: "Phone, email and directions are real links; directions says it opens in a new tab" },
    ],
    customization: ["Hours can be half hours (17.5) and any set of days", "Phone numbers are shown left to right in right-to-left layouts, like any number", "The map and its pins keep their geography in every language"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
