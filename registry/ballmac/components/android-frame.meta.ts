import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "android-frame",
  type: "registry:ui",
  title: "Android Frame",
  description:
    "A modern Android phone drawn in CSS: satin frame in porcelain, obsidian or sage, centered punch-hole camera, Material-style status bar and gesture or three-button navigation. Children render at phone resolution, scaled to fit.",
  category: "devices",
  tags: ["mockup", "device", "phone", "android", "pixel", "mobile", "hero"],
  files: [{ path: "components/android-frame.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "media"],
  examples: [
    { name: "android-frame-demo", title: "Home screen", file: "android-frame-demo.tsx" },
    { name: "android-frame-buttons", title: "Three-button navigation", file: "android-frame-buttons.tsx" },
  ],
  ai: {
    summary:
      "Wrap a mobile screen in <AndroidFrame screenWidth={412}>: children render below a status bar at 412 CSS px wide and are scaled to the frame's width. Set the width with className (e.g. w-64).",
    whenToUse: ["Showing an Android or responsive mobile app", "Side by side with phone-frame for cross-platform stories"],
    whenNotToUse: ["iPhone mockups (phone-frame)", "Real device screenshots with a bezel"],
    composesWith: ["phone-frame", "tablet-frame", "laptop-frame"],
    a11y: [
      { keys: "Static", action: "Purely visual: no focusable elements from the frame" },
      { keys: "Reduced motion", action: "Video on the screen is not autoplayed" },
    ],
    customization: ["variant: auto | porcelain | obsidian | sage", "navigation: gesture | buttons | none", "screenWidth: virtual width in CSS px", "statusBar, time", "src/alt or videoSrc/poster instead of children"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
