import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "feel-presets",
  type: "registry:lib",
  title: "Feel Presets",
  description: "Read and set the platform feel (web, macOS, iOS or Windows), detect the device's own, and remember an override. useFeel for components that need to know.",
  category: "foundation",
  tags: ["feel", "platform", "macos", "windows", "ios", "detect", "tauri", "electron"],
  files: [{ path: "lib/feel.ts" }],
  dependencies: [],
  ai: {
    summary: "useFeel() returns the current feel and setFeel(). detectFeel() reads the platform from the user agent (browser, Tauri, Electron). setFeel('auto') returns to the device's own feel. The feel is the data-feel attribute on <html>.",
    whenToUse: ["A component needs to behave differently per platform, such as which side the window controls sit on", "Letting users override the detected feel in settings"],
    whenNotToUse: ["Styling that tokens already handle: use the --bm-* variables and Tailwind classes, which follow the feel by themselves"],
    customization: ["setFeel('macos') | 'ios' | 'windows' | 'web' | 'auto'", "Put data-feel on a container to scope a feel to part of the page"],
  },
  version: "1.0.0",
  updated: "2026-10-12",
})
