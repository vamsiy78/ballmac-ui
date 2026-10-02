import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "mac-window",
  type: "registry:ui",
  title: "Mac Window",
  description:
    "macOS window chrome: traffic lights whose glyphs appear on hover, a centered title or unified toolbar, an optional translucent sidebar with vibrancy, and active and inactive appearances.",
  category: "macos",
  tags: ["window", "macos", "traffic lights", "chrome", "mockup", "sidebar", "frame"],
  files: [{ path: "components/mac-window.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "mac-window-demo", title: "Notes app", file: "mac-window-demo.tsx" },
    { name: "mac-window-stack", title: "Active and inactive", file: "mac-window-stack.tsx" },
  ],
  ai: {
    summary:
      "Frame content as a Mac app window. Simple: <MacWindow><MacWindowTitleBar title=\"…\" /><MacWindowContent>…</MacWindowContent></MacWindow>. Sidebar layout: <MacWindow><MacWindowSidebar>rows…</MacWindowSidebar><MacWindowMain><MacWindowTitleBar controls={false} title>toolbar buttons</MacWindowTitleBar><MacWindowContent/></MacWindowMain></MacWindow>. Size the window with className.",
    whenToUse: [
      "Product screenshots and mockups of a Mac app on a landing page",
      "Framing a code sample, terminal session or settings panel so it reads as desktop software",
      "Interactive app demos where the sidebar and toolbar actually work",
    ],
    whenNotToUse: [
      "Modal dialogs in a web app (use dialog)",
      "Browser mockups; this draws native window chrome, not an address bar",
    ],
    composesWith: ["dock", "menu-bar", "segmented-control"],
    a11y: [
      { keys: "Tab", action: "Reaches the traffic lights only when onClose, onMinimize or onZoom handlers are set, then toolbar and sidebar buttons" },
      { keys: "Enter / Space", action: "Activates the focused traffic light or button" },
    ],
    customization: [
      "active: false grays the lights and title like a background window",
      "onClose / onMinimize / onZoom: make the lights real buttons with aria-labels (labels prop on MacWindowControls)",
      "--mac-close, --mac-minimize, --mac-zoom: traffic-light colors (CSS variables on the window)",
      "MacWindowTitleBar: title, controls, children become a trailing toolbar (use MacWindowToolbarButton)",
      "MacWindowSidebar: translucent, blurs what's behind the window; MacWindowSidebarItem for rows (selected sets aria-current)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
