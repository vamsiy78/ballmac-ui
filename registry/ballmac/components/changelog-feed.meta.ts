import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "changelog-feed",
  type: "registry:ui",
  title: "Changelog Feed",
  description:
    "A release-notes feed with a sticky date and version column, change-type labels, optional media, filter chips with counts and show-more for long releases.",
  category: "saas",
  tags: ["changelog", "release notes", "updates", "timeline"],
  files: [{ path: "components/changelog-feed.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n"],
  examples: [
    { name: "changelog-feed-demo", title: "Release notes", file: "changelog-feed-demo.tsx" },
    { name: "changelog-feed-states", title: "Single release with media", file: "changelog-feed-states.tsx" },
  ],
  ai: {
    summary:
      "entries[] with {id,version,date (ISO),title,summary,changes:[{type,text}],media}. Types: new | improved | fixed | removed. Dates format in UTC.",
    whenToUse: ["Product changelog pages", "What's-new surfaces"],
    whenNotToUse: ["Activity of people on a record; use activity-feed", "A single status message; use banner"],
    composesWith: ["timeline", "activity-feed", "badge"],
    a11y: [
      { keys: "Tab", action: "Filter chips and show-more are buttons with aria-pressed / aria-expanded" },
      { keys: "Screen readers", action: "Each release is an article with a time element; change types have text labels" },
    ],
    customization: ["filterable", "collapsedCount", "locale", "media"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
