import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "desktop-5",
  type: "registry:block",
  title: "Desktop 5: permissions setup",
  description:
    "The first-run permissions window: why each one is needed, Allow for ones not asked yet, the exact System Settings path for ones turned off, a re-check on return, and Continue once required ones are on.",
  category: "blocks",
  blockCategory: "desktop",
  tags: ["desktop", "permissions", "onboarding", "first run", "privacy", "accessibility", "screen recording", "tauri", "electron", "macos", "windows", "feel"],
  files: [{ path: "components/blocks/desktop-5/desktop-5.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "app-window", "button", "skeleton", "state-view", "feel-presets"],
  examples: [
    { name: "desktop-5-demo", title: "macOS", file: "desktop-5-demo.tsx" },
    { name: "desktop-5-windows", title: "Windows", file: "desktop-5-windows.tsx" },
    { name: "desktop-5-loading", title: "Checking", file: "desktop-5-loading.tsx" },
    { name: "desktop-5-error", title: "Could not read", file: "desktop-5-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Checking", example: "desktop-5-loading", trigger: "state=\"loading\"", note: "Skeleton rows while the current statuses are read; Continue is disabled." },
    { id: "error", title: "Could not read", example: "desktop-5-error", trigger: "state=\"error\"", note: "An alert that points to System Settings, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A permissions onboarding window. <Desktop5 appName permissions={[{ id, title, description, required, status: 'granted' | 'denied' | 'prompt', settingsPath: { macos, windows } }]} onRequest={async (id) => status} onOpenSettings={(id) => open(url)} onRecheck={() => refresh()} onContinue />. onRecheck runs when the window regains focus, which is when people return from System Settings.",
    whenToUse: ["First run of a Tauri or Electron app that needs Accessibility, Screen Recording, Microphone, Camera, Full Disk Access or Notifications", "A Permissions pane that shows what is on and off"],
    whenNotToUse: ["Product onboarding questions (use onboarding-1)", "Cookie consent on a website"],
    composesWith: ["desktop-1", "desktop-4", "app-window", "feel-auto"],
    a11y: [
      { keys: "Tab", action: "Each Allow or Open Settings button is named for its permission" },
      { keys: "Continue", action: "Disabled until required permissions are on; the reason is linked with aria-describedby and announced as it changes" },
    ],
    customization: [
      "feel: 'macos' | 'windows' (defaults to the page's feel); the settings app name and paths follow it",
      "macOS deep links for onOpenSettings: x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility (or Privacy_ScreenCapture, Privacy_Microphone)",
      "Windows: ms-settings:privacy-microphone, ms-settings:privacy-webcam, ms-settings:notifications",
      "Tauri: tauri-plugin-macos-permissions reads and requests the macOS ones",
      "onSkip shows \"Set up later\"",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
