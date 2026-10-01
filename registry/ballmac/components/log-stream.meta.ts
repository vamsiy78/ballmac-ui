import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "log-stream",
  type: "registry:ui",
  title: "Log Stream",
  description:
    "A live log viewer with level filters and counts, search with highlighted matches, wrap, pause with a new-lines counter, follow-the-tail scrolling and copy.",
  category: "developer",
  tags: ["logs", "stream", "console", "debug", "tail"],
  files: [{ path: "components/log-stream.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "copy-button"],
  examples: [
    { name: "log-stream-demo", title: "Live deploy logs", file: "log-stream-demo.tsx" },
    { name: "log-stream-static", title: "Filtered build output", file: "log-stream-static.tsx" },
  ],
  ai: {
    summary:
      "lines is [{ id, time, level, message, source? }], oldest first; append as lines arrive. Follows the tail while you are at the bottom, shows 'N new lines' when paused or scrolled up. maxLines limits what is rendered.",
    whenToUse: ["Deploy, build and server logs", "Streaming output from background jobs"],
    whenNotToUse: ["A terminal with input (terminal)", "Millions of lines (use a virtualized list)"],
    composesWith: ["terminal", "status-dot", "copy-button"],
    a11y: [
      { keys: "Tab", action: "Reaches filters, search, wrap, pause, copy, then the scrollable log (role=log)" },
      { keys: "Screen readers", action: "The log is not announced line by line; pause state is announced; levels are words" },
      { keys: "Color", action: "Level is a word and a bar" },
    ],
    customization: ["maxLines", "follow", "height", "wrap", "hideSource", "onClear"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
