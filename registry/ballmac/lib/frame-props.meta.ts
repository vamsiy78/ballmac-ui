import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "frame-props",
  type: "registry:lib",
  title: "Frame Props",
  description: "Picks the plain HTML attributes from a block's props, so a block that shows a loading or error frame never spreads its own data props onto a DOM element. Safe in server components.",
  category: "foundation",
  tags: ["state", "props", "server", "helper"],
  files: [{ path: "lib/frame-props.ts" }],
  dependencies: [],
  ai: {
    summary: "frameProps(props) returns only id, style, lang, dir, role, hidden, title, tabIndex and aria-* and data-* attributes. Spread it onto the frame a block draws while it is loading or has failed.",
    whenToUse: ["Writing a block with a state prop: the frame it draws instead of its content", "A server component that needs the same helper state-view exports"],
    whenNotToUse: ["Passing every prop through to the ready block: spread them as normal"],
    composesWith: ["state-view"],
    customization: ["Add attributes by wrapping it: { ...frameProps(props), onClick }"],
  },
  version: "1.0.0",
  updated: "2026-10-12",
})
