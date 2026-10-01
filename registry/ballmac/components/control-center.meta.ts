import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "control-center",
  type: "registry:ui",
  title: "Control Center",
  description:
    "The macOS Control Center panel in frosted glass: toggle tiles with round badges, grouped Wi-Fi, Bluetooth and AirDrop rows, pill sliders with the icon in the track, and a Now Playing tile. Real toggle buttons and Radix sliders.",
  category: "macos",
  tags: ["control-center", "macos", "toggles", "slider", "settings", "panel", "media"],
  files: [{ path: "components/control-center.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "control-center-demo", title: "Full panel", file: "control-center-demo.tsx" },
    { name: "control-center-compact", title: "Tiles only", file: "control-center-compact.tsx" },
  ],
  ai: {
    summary:
      "<ControlCenter> is a 2-column grid. Put <ControlCluster> with <ControlRow> toggles first, then <ControlTile>, <ControlSlider label icon> and <ControlNowPlaying>. Toggles are controlled with pressed / onPressedChange or uncontrolled.",
    whenToUse: ["Mac system UI mockups", "Quick-settings popovers"],
    whenNotToUse: ["Full settings pages (use field, switch, slider)"],
    composesWith: ["menu-bar", "mac-window", "hud", "switch"],
    a11y: [
      { keys: "Tab / Space / Enter", action: "Every tile and row is a button with aria-pressed" },
      { keys: "Arrow keys", action: "Adjust a slider; Home and End jump to the ends" },
      { keys: "Reduced motion", action: "No press scale or color transitions" },
    ],
    customization: ["ControlTile: icon, label, status, pressed, stacked", "ControlSlider: label, icon, value, onValueChange", "ControlNowPlaying: title, artist, artwork, playing"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
