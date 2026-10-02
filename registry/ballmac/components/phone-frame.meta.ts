import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "phone-frame",
  type: "registry:ui",
  title: "Phone Frame",
  description:
    "A modern phone drawn in CSS: titanium band, side buttons, Dynamic Island, status bar and home indicator. Children render as the screen, laid out at a phone resolution and scaled to fit.",
  category: "devices",
  tags: ["mockup", "device", "phone", "iphone", "mobile", "screenshot", "hero"],
  files: [{ path: "components/phone-frame.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "media"],
  examples: [
    { name: "phone-frame-demo", title: "Wallet app", file: "phone-frame-demo.tsx" },
    { name: "phone-frame-chat", title: "Black, dark screen", file: "phone-frame-chat.tsx" },
  ],
  ai: {
    summary:
      "Wrap a mobile screen in <PhoneFrame screenWidth={390}>: children render below a status bar at 390 CSS px wide and are scaled to the frame's width. Set the frame width with className (e.g. w-64); height follows the phone's aspect ratio.",
    whenToUse: [
      "Showing a mobile app or responsive site on a landing page",
      "App Store-style feature sections with live React screens",
      "Pairing with laptop-frame to show desktop and mobile together",
    ],
    whenNotToUse: [
      "Desktop apps or websites at desktop width (use laptop-frame or browser-frame)",
      "Real device screenshots that already include the bezel",
    ],
    composesWith: ["laptop-frame"],
    customization: [
      "variant: auto (natural titanium in light, black in dark) | natural | black",
      "screenWidth: virtual width in CSS px, e.g. 390",
      "statusBar, time (default \"9:41\"), homeIndicator",
      "screenClassName=\"dark\" gives the screen its own theme regardless of the page",
      "src/alt or videoSrc/poster to show media instead of children",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
