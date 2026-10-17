import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-3",
  type: "registry:block",
  title: "Desktop 3: software update",
  description:
    "The update window of a desktop app, the whole cycle: checking, a new version with release notes, downloading with progress, ready to relaunch, up to date and failed. Buttons follow each platform's order and wording.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "update", "updater", "sparkle", "release notes", "tauri", "electron", "macos", "windows", "progress", "feel"],
  files: [{ path: "components/blocks/desktop-3/desktop-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "app-window", "button", "checkbox", "progress", "spinner", "state-view", "use-resource", "feel-presets"],
  examples: [
    { name: "desktop-3-demo", title: "macOS: update available", file: "desktop-3-demo.tsx" },
    { name: "desktop-3-windows", title: "Windows", file: "desktop-3-windows.tsx" },
    { name: "desktop-3-checking", title: "Checking", file: "desktop-3-checking.tsx" },
    { name: "desktop-3-downloading", title: "Downloading", file: "desktop-3-downloading.tsx" },
    { name: "desktop-3-ready", title: "Ready to relaunch", file: "desktop-3-ready.tsx" },
    { name: "desktop-3-up-to-date", title: "Up to date", file: "desktop-3-up-to-date.tsx" },
    { name: "desktop-3-error", title: "Download failed", file: "desktop-3-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Checking", example: "desktop-3-checking", trigger: "state=\"loading\"", note: "A spinner and \"Checking for updates…\" with the current version; marked busy." },
    { id: "submitting", title: "Downloading", example: "desktop-3-downloading", trigger: "state=\"submitting\" progress={0.4}", note: "A progress bar with megabytes done of the total; the release notes stay readable and Hide keeps it going in the background." },
    { id: "success", title: "Ready to relaunch", example: "desktop-3-ready", trigger: "state=\"success\"", note: "\"Install and Relaunch\" (macOS) or \"Restart now\" (Windows) calls onRelaunch; the other button installs on quit." },
    { id: "empty", title: "Up to date", example: "desktop-3-up-to-date", trigger: "state=\"empty\"", note: "Says the current version is the newest, with OK." },
    { id: "error", title: "Download failed", example: "desktop-3-error", trigger: "state=\"error\"", note: "Says nothing was changed and offers Try Again (onRetry); errorState sets the copy." },
  ],
  ai: {
    summary:
      "An updater window. Leave state out and it runs itself: <Desktop3 currentVersion releases={[{ version, date, changes: [{ type: 'new' | 'improved' | 'fixed', text }] }]} onInstall={async (report) => { …; report(0.5) }} onRelaunch onSkip onRemindLater />. Or drive it from your updater with state (loading = checking, submitting + progress = downloading, success = ready, empty = up to date, error). macOS: Title Case buttons, default button last. Windows: sentence case, default button first.",
    whenToUse: ["The update prompt of a Tauri app (tauri-plugin-updater) or an Electron app (electron-updater)", "A changelog-style \"what's new\" window after an update"],
    whenNotToUse: ["A public changelog page (use changelog-1)", "A small in-app banner that an update exists (use banner)"],
    composesWith: ["desktop-1", "app-window", "feel-auto"],
    a11y: [
      { keys: "Heading", action: "Each stage's heading is announced politely; the byte count is not, so it does not chatter" },
      { keys: "Tab to the release notes", action: "The notes region scrolls with the arrow keys" },
      { keys: "Tab", action: "Buttons are in the platform's visual order, so focus order matches what people see" },
    ],
    customization: [
      "feel: 'macos' | 'windows' (defaults to the page's feel); frame={false} inside a real native window",
      "Tauri: const update = await check(); onInstall={(report) => update.downloadAndInstall((e) => …report(done / total))}; onRelaunch={() => relaunch()}",
      "Electron: map autoUpdater's checking-for-update, download-progress, update-downloaded and error events onto state and progress; onRelaunch={() => autoUpdater.quitAndInstall()}",
      "automatic + onAutomaticChange control the checkbox; size is the download size in bytes",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
