import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "devices-1",
  type: "registry:block",
  title: "Devices 1: Mac, iPad, iPhone and Watch lineup",
  description: "A lineup of laptop, tablet, phone and watch frames with their own token-drawn screens, scaled as one picture. Buttons underneath bring a device forward and dim the rest.",
  category: "blocks",
  blockCategory: "devices",
  tags: ["devices", "mac", "ipad", "iphone", "watch", "multi-platform", "lineup"],
  files: [{ path: "components/blocks/devices-1/devices-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "laptop-frame", "phone-frame", "tablet-frame", "watch-frame"],
  examples: [
    { name: "devices-1-demo", title: "Default", file: "devices-1-demo.tsx" },
    { name: "devices-1-custom", title: "Your own screens", file: "devices-1-custom.tsx" },
  ],
  ai: {
    summary: "A multi-platform section. Edit eyebrow, title, description and captions; pass screens={{ mac, ipad, iphone, watch }} to replace the sample screens, each laid out at its real device width (1280, 834, 393, 208).",
    whenToUse: ["Apps that ship on several Apple platforms", "Showing responsive or cross-device behaviour"],
    whenNotToUse: ["Single-platform products (use hero-5 or showcase-1)"],
    composesWith: ["hero-5", "features-4", "download-1", "pricing-4"],
    a11y: [
      { keys: "Tab / Enter on a device button", action: "Brings that device forward (aria-pressed); pressing again clears it" },
      { keys: "Picture", action: "Hidden from assistive technology; the four buttons describe each device in words" },
      { keys: "Reduced motion", action: "Devices change focus without moving" },
    ],
    customization: ["captions per device", "screens: any node per device"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
