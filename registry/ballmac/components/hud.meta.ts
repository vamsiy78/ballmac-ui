import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hud",
  type: "registry:ui",
  title: "HUD",
  description:
    "The macOS volume and brightness HUD: a dark frosted square with a big icon and a 16-segment bar, or a slim capsule with a smooth bar. Pops in, restarts its timer when the value changes, fades out and announces the new level.",
  category: "macos",
  tags: ["hud", "volume", "brightness", "macos", "overlay", "feedback"],
  files: [{ path: "components/hud.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "hud-demo", title: "Volume keys", file: "hud-demo.tsx" },
    { name: "hud-pill", title: "Capsule variant", file: "hud-pill.tsx" },
  ],
  ai: {
    summary:
      "<Hud kind=\"volume\" value={60} visible={visible} onVisibleChange={setVisible} /> inside a relative container. useTransientHud() gives { visible, show, hide, onVisibleChange }.",
    whenToUse: ["Keyboard-driven level changes in desktop UI demos", "Transient feedback for hardware-style controls"],
    whenNotToUse: ["Toasts and messages (toast)", "Persistent controls (slider)"],
    composesWith: ["control-center", "menu-bar", "keyboard-shortcuts"],
    a11y: [
      { keys: "Screen readers", action: "A polite status message says the new level; the visual HUD is hidden from them" },
      { keys: "Reduced motion", action: "Fades without scaling" },
    ],
    customization: ["kind: volume | brightness | keyboard", "variant: mac | pill", "muted, duration, value 0 to 100"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
