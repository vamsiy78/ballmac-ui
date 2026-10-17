import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-6",
  type: "registry:block",
  title: "Desktop 6: About window",
  description:
    "The About window of a desktop app: icon, name, version and build with a copy button, links, open-source acknowledgements and Check for updates. Small and centered on macOS, a dialog with OK on Windows.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "about", "version", "acknowledgements", "credits", "licenses", "tauri", "electron", "macos", "windows", "feel"],
  files: [{ path: "components/blocks/desktop-6/desktop-6.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "app-window", "button", "feel-presets"],
  examples: [
    { name: "desktop-6-demo", title: "macOS", file: "desktop-6-demo.tsx" },
    { name: "desktop-6-windows", title: "Windows", file: "desktop-6-windows.tsx" },
  ],
  statesNone: "Static content: nothing to load, submit or fail.",
  ai: {
    summary:
      "An About window. <Desktop6 appName version build tagline copyright links={[{ label, href }]} acknowledgements={[{ name, license, href }]} onCheckForUpdates onClose />. Acknowledgements open in the same window with a Back button; the copy button puts \"Acme Version 2.4.1 (241)\" on the clipboard.",
    whenToUse: ["The About item in a Tauri or Electron app's app menu", "Crediting the open-source licences a desktop app ships with"],
    whenNotToUse: ["A company About page on a website (use team-1 or a marketing block)"],
    composesWith: ["desktop-1", "desktop-3", "app-window", "feel-auto"],
    a11y: [
      { keys: "Tab", action: "The copy button is named \"Copy version\" and announces \"Version copied\"" },
      { keys: "Acknowledgements", action: "The list is a focusable scroll region; Back returns to the About view" },
    ],
    customization: [
      "feel: 'macos' | 'windows' (defaults to the page's feel); frame={false} inside a real native window",
      "Tauri: version from getVersion() in @tauri-apps/api/app; Electron: app.getVersion()",
      "Generate acknowledgements from your lockfile with a licence checker at build time",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
