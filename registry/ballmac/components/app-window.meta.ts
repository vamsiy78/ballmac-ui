import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "app-window",
  type: "registry:ui",
  title: "App Window",
  description:
    "The window chrome of a real desktop app (Tauri or Electron): a title bar that drags the window, double-click to maximize, and the controls the platform draws: traffic lights, Windows caption buttons, or none.",
  category: "macos",
  tags: ["window", "titlebar", "tauri", "electron", "desktop", "macos", "windows", "chrome", "drag region", "feel"],
  files: [{ path: "components/app-window.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n", "feel-presets"],
  examples: [
    { name: "app-window-demo", title: "Notes app, in any feel", file: "app-window-demo.tsx" },
    { name: "app-window-feels", title: "One window, three feels", file: "app-window-feels.tsx" },
  ],
  source: {
    name: "tauri-controls",
    url: "https://github.com/agmmnn/tauri-controls",
    license: "MIT",
    copyright: "Copyright (c) 2023 agmmnn",
    modified: true,
  },
  ai: {
    summary:
      "Real window chrome for a Tauri or Electron app. <AppWindow onClose onMinimize onMaximize><AppWindowTitleBar title=\"…\">toolbar</AppWindowTitleBar><AppWindowContent/></AppWindow>. It draws the platform's controls (macOS traffic lights on the left, Windows caption buttons on the right, none on iOS or web) from the page's feel, drags the window, and maximizes on double-click. You wire the callbacks; there is no Tauri or Electron dependency.",
    whenToUse: [
      "The window of a Tauri or Electron app with a hidden native title bar (decorations: false, or titleBarStyle hidden)",
      "A desktop-style web app that should match the platform's window chrome",
    ],
    whenNotToUse: [
      "Landing-page mockups of a Mac app (use mac-window)",
      "Modal dialogs inside a web app (use dialog)",
    ],
    composesWith: ["feel-auto", "sidebar", "toolbar", "button"],
    a11y: [
      { keys: "Tab", action: "Reaches the window controls when their handlers are set, then the toolbar" },
      { keys: "Enter / Space", action: "Presses the focused window control" },
      { keys: "Double-click the bar", action: "Maximizes or restores (calls onMaximize)" },
    ],
    customization: [
      "feel: 'macos' | 'windows' | 'ios' | 'web' overrides the page's feel for this window",
      "active: defaults to following real window focus; maximized switches the Windows button to restore and squares the corners",
      "onFullscreen: the macOS green button; hold Option to call onMaximize instead",
      "Tauri v2: onClose={() => getCurrentWindow().close()}; Electron: send an IPC message from the handler",
      "AppWindowControls renders only the controls, for a custom title bar",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-12",
})
