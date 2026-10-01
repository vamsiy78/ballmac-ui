import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "lock-screen",
  type: "registry:ui",
  title: "Lock Screen",
  description:
    "A full-screen lock screen in two flavors: macOS (live clock, avatar, password field that shakes when wrong) and iOS (clock, notification stack, flashlight and camera, swipe up to unlock). Hydration-safe clock.",
  category: "macos",
  tags: ["lock-screen", "login", "macos", "ios", "clock", "password", "wallpaper"],
  files: [{ path: "components/lock-screen.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "lock-screen-demo", title: "macOS password lock", file: "lock-screen-demo.tsx" },
    { name: "lock-screen-ios", title: "iOS in a phone", file: "lock-screen-ios.tsx" },
  ],
  ai: {
    summary:
      "<LockScreen variant=\"mac\" password=\"hello\" /> fills its positioned parent until unlocked. variant=\"ios\" takes notifications as children and unlocks by swiping up or pressing the button. Control with locked / onLockedChange.",
    whenToUse: ["Mac or phone UI demos with a login moment", "Idle or session-timeout screens"],
    whenNotToUse: ["Real authentication: the password prop is for demos, check credentials on a server"],
    composesWith: ["phone-frame", "notification-stack", "mac-window", "menu-bar"],
    a11y: [
      { keys: "Tab", action: "Reaches the password field and the Unlock button" },
      { keys: "Enter", action: "Submits the password" },
      { keys: "Wrong password", action: "Announced as an alert and the field shakes (no shake with reduced motion)" },
      { keys: "Reduced motion", action: "Fade instead of slide, blur and scale; iOS shows an Unlock button" },
    ],
    customization: ["variant: mac | ios", "password, onUnlock, hint, name, avatar", "time and date for a fixed clock (omit for live)", "wallpaper replaces the default", "locked / defaultLocked / onLockedChange"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
