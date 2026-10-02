import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tablet-frame",
  type: "registry:ui",
  title: "Tablet Frame",
  description:
    "A modern tablet drawn in CSS: brushed aluminum frame, thin glass bezel, front camera, status bar and home indicator. Landscape or portrait with the same proportions; children render as the screen at tablet resolution, scaled to fit.",
  category: "devices",
  tags: ["mockup", "device", "tablet", "ipad", "screenshot", "hero"],
  files: [{ path: "components/tablet-frame.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "media"],
  examples: [
    { name: "tablet-frame-demo", title: "Dashboard, landscape", file: "tablet-frame-demo.tsx" },
    { name: "tablet-frame-portrait", title: "Portrait reader", file: "tablet-frame-portrait.tsx" },
  ],
  ai: {
    summary:
      "Wrap a tablet screen in <TabletFrame screenWidth={1194}>: children render below a status bar at 1194 CSS px wide (834 in portrait) and are scaled to the frame's width. Set the width with className; the height follows the aspect ratio.",
    whenToUse: ["Showing a dashboard or app on a landing page", "Pairing with phone-frame and laptop-frame in a device lineup"],
    whenNotToUse: ["Phone-sized screens (phone-frame, android-frame)", "Real screenshots that already include a bezel"],
    composesWith: ["phone-frame", "laptop-frame", "watch-frame"],
    a11y: [
      { keys: "Static", action: "Purely visual: the frame adds no focusable elements and hides its decoration from assistive tech" },
      { keys: "Reduced motion", action: "Video on the screen is not autoplayed" },
    ],
    customization: ["orientation: landscape | portrait", "variant: auto | silver | black", "screenWidth: virtual width in CSS px", "statusBar, time, date, homeIndicator", "src/alt or videoSrc/poster instead of children", "screenClassName=\"dark\" gives the screen its own theme"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
