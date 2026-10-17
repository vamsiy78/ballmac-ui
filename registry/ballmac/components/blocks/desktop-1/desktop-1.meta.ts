import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-1",
  type: "registry:block",
  title: "Desktop 1: preferences window",
  description:
    "The Settings window of a Tauri or Electron app: toolbar tabs on macOS, a side nav with setting cards on Windows. Launch at login, menu bar, appearance, a global shortcut recorder and update settings that apply as they change.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "preferences", "settings", "tauri", "electron", "macos", "windows", "shortcut", "hotkey", "feel"],
  files: [{ path: "components/blocks/desktop-1/desktop-1.tsx" }],
  dependencies: ["lucide-react", "radix-ui"],
  registryDependencies: ["shadcn:utils", "app-window", "button", "segmented-control", "select", "switch", "direction", "feel-presets", "shortcut"],
  examples: [
    { name: "desktop-1-demo", title: "macOS", file: "desktop-1-demo.tsx" },
    { name: "desktop-1-windows", title: "Windows", file: "desktop-1-windows.tsx" },
    { name: "desktop-1-custom", title: "Your own pane, no frame", file: "desktop-1-custom.tsx" },
  ],
  statesNone: "Settings apply the moment they change, as desktop apps do: nothing to load, submit or fail.",
  ai: {
    summary:
      "A complete preferences window. <Desktop1 appName defaultValues onValuesChange={(v) => persist(v)} onCheckForUpdates />. Panes: General, Appearance, Shortcuts (a key-combination recorder that writes ⇧⌘Space on a Mac and Ctrl+Shift+Space on Windows), Updates, Advanced, plus extraPanes. Layout follows the feel: toolbar tabs and a pane-named title on macOS, side nav and setting cards on Windows.",
    whenToUse: ["The Settings or Preferences window of a Tauri or Electron app", "A desktop-style web app that needs app-level preferences"],
    whenNotToUse: ["Account settings saved with a button (use settings-1)", "A settings page inside a web app's layout (use settings-2 or settings-panel)"],
    composesWith: ["app-window", "feel-auto", "desktop-3", "desktop-6"],
    a11y: [
      { keys: "Arrow keys in the tabs", action: "Move between panes (left and right on macOS, up and down in the Windows side nav); right-to-left swaps them" },
      { keys: "Enter on the shortcut field", action: "Starts recording; the next combination with a modifier is saved, Escape cancels, Delete clears" },
      { keys: "Tab", action: "Every switch, segmented control and select is labelled by its row" },
    ],
    customization: [
      "feel: 'macos' | 'windows' | 'ios' | 'web' (defaults to the page's feel)",
      "frame={false} drops the window chrome inside a real native window",
      "values + onValuesChange to control it; shortcut strings use Mod for ⌘ or Ctrl, e.g. 'Mod+Shift+Space'",
      "extraPanes=[{ id, label, icon, content }]; formatShortcut(shortcut, feel) is exported for your menus",
      "Tauri: pass the shortcut to @tauri-apps/plugin-global-shortcut (replace Mod with CommandOrControl)",
    ],
  },
  version: "1.0.1",
  updated: "2026-10-17",
  changelog: [
    { version: "1.0.1", date: "2026-10-17", note: "The shortcut formatting and recording moved into the shortcut lib item, which this block now installs. formatShortcut is still exported from here; behaviour is unchanged." },
    { version: "1.0.0", date: "2026-10-17", note: "First release." },
  ],
})
