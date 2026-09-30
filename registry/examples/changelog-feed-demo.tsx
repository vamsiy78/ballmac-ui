import { ChangelogFeed, type ChangelogEntry } from "@/components/ballmac/changelog-feed";
const entries: ChangelogEntry[] = [
  {
    id: "2-4",
    version: "2.4.0",
    date: "2026-09-24",
    title: "Automations and a faster inbox",
    summary: "Run tasks when things change, and move through notifications twice as fast.",
    changes: [
      { type: "new", text: "Automations: trigger actions when a task changes status." },
      { type: "new", text: "Keyboard shortcuts for every inbox action." },
      { type: "improved", text: "The inbox loads in about half the time on large workspaces." },
      { type: "improved", text: "Clearer empty states across projects and reports." },
      { type: "fixed", text: "Comments no longer lose formatting when edited." },
      { type: "fixed", text: "Dates in exported reports now match your timezone." },
    ],
  },
  {
    id: "2-3",
    version: "2.3.2",
    date: "2026-09-09",
    title: "Reliability and polish",
    changes: [
      { type: "fixed", text: "Fixed a rare crash when reordering tasks quickly." },
      { type: "improved", text: "Smoother scrolling in long project lists." },
      { type: "removed", text: "Removed the legacy import tool. Use Import from the project menu." },
    ],
  },
  {
    id: "2-3-0",
    version: "2.3.0",
    date: "2026-08-20",
    title: "Reports, redesigned",
    summary: "Charts are easier to read and to share.",
    changes: [
      { type: "new", text: "Share a report with a public link." },
      { type: "improved", text: "New color palette that works in light and dark." },
    ],
  },
];
export default function ChangelogFeedDemo() {
  return <ChangelogFeed entries={entries} className="max-w-3xl" />;
}
