import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "watch-frame",
  type: "registry:ui",
  title: "Watch Frame",
  description:
    "A smartwatch drawn in CSS: rounded aluminum case, digital crown and side button, curved glass and a fading strap in sport, loop or leather. The screen is always dark and children render scaled to fit.",
  category: "devices",
  tags: ["mockup", "device", "watch", "apple-watch", "wearable", "hero"],
  files: [{ path: "components/watch-frame.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "media"],
  examples: [
    { name: "watch-frame-demo", title: "Analog face", file: "watch-frame-demo.tsx" },
    { name: "watch-frame-workout", title: "Workout, loop band", file: "watch-frame-workout.tsx" },
  ],
  ai: {
    summary:
      "<WatchFrame screenWidth={208} band=\"sport\" bandTone=\"blue\"> renders children as the watch screen at 208 CSS px wide, scaled to fit. Set the width with className (about w-40).",
    whenToUse: ["Wearable app showcases", "Device lineups next to phone-frame"],
    whenNotToUse: ["Large UI that needs a normal screen (phone-frame)"],
    composesWith: ["phone-frame", "tablet-frame", "progress-ring"],
    a11y: [
      { keys: "Static", action: "Purely visual: no focusable elements from the frame" },
      { keys: "Reduced motion", action: "Video on the screen is not autoplayed" },
    ],
    customization: ["variant: auto | silver | black | gold", "band: sport | loop | leather | none", "bandTone: blue | teal | orange | purple | graphite | red", "screenWidth: virtual width in CSS px", "src/alt or videoSrc/poster instead of children"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
