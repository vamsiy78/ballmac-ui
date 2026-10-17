import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-7",
  type: "registry:block",
  title: "Desktop 7: welcome window",
  description:
    "The window a desktop app opens with when nothing is open: name and version, ways to start (new, open, clone) with shortcuts, and recent projects to search, open with Enter and remove from the list.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "welcome", "start", "recent", "projects", "launcher", "tauri", "electron", "macos", "windows", "feel"],
  files: [{ path: "components/blocks/desktop-7/desktop-7.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "app-window", "button", "checkbox", "skeleton", "state-view", "feel-presets", "shortcut"],
  examples: [
    { name: "desktop-7-demo", title: "macOS", file: "desktop-7-demo.tsx" },
    { name: "desktop-7-windows", title: "Windows", file: "desktop-7-windows.tsx" },
    { name: "desktop-7-loading", title: "Loading recents", file: "desktop-7-loading.tsx" },
    { name: "desktop-7-empty", title: "First launch", file: "desktop-7-empty.tsx" },
    { name: "desktop-7-error", title: "Could not read recents", file: "desktop-7-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading recents", example: "desktop-7-loading", trigger: "state=\"loading\"", note: "Skeleton rows in the Recent column while the list is read; the start actions work straight away." },
    { id: "empty", title: "First launch", example: "desktop-7-empty", trigger: "state=\"empty\" (or recents={[]})", note: "Says opened projects will be listed; emptyState can add an action." },
    { id: "error", title: "Could not read recents", example: "desktop-7-error", trigger: "state=\"error\"", note: "An alert in the Recent column with Try again (onRetry); the start actions still work." },
  ],
  ai: {
    summary:
      "A welcome or launcher window. <Desktop7 appName version actions={[{ id, label, description, icon, shortcut: 'Mod+N' }]} recents={[{ id, name, path, opened }]} onAction onOpenRecent onRemoveRecent showOnLaunch onShowOnLaunchChange />. Recents are a combobox with a listbox: type to search, arrows to move, Enter to open.",
    whenToUse: ["The start window of an editor, IDE or document app built with Tauri or Electron", "Choosing a recent project before the main window opens"],
    whenNotToUse: ["A dashboard home inside a web app (use dashboard-1)", "Signing in (use login-1)"],
    composesWith: ["desktop-1", "desktop-6", "app-window", "feel-auto"],
    a11y: [
      { keys: "Up / Down in the search field", action: "Moves through recent projects; the selection is announced" },
      { keys: "Enter", action: "Opens the selected project" },
      { keys: "Tab", action: "Reaches each start action and Remove from list for the selected project" },
    ],
    customization: ["feel: 'macos' | 'windows' (defaults to the page's feel); shortcuts are written in the platform's notation", "Tauri: keep recents in the store plugin; open with the dialog plugin's open({ directory: true })"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
