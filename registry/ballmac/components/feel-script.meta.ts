import { defineItem } from "@ballmac-ui/metadata"
import { buildTheme, DEFAULT_SPEC, feelSpec, FEELS, feelRules, normalizeSpec } from "@ballmac-ui/theme-engine"

/** Every feel's handling variables under its own `data-feel`, so one page can be any of them. */
const handling = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).filter(([k]) => k === "radius" || k.startsWith("bm-")).map(([k, v]) => [`--${k}`, v]))
const blocks = Object.fromEntries(
  FEELS.map((f) => {
    const vars = buildTheme(normalizeSpec({ ...DEFAULT_SPEC, ...feelSpec(f.slug) }))
    return [`[data-feel="${f.slug}"]`, { ...handling(vars.light), ...(vars.theme.spacing ? { "--spacing": vars.theme.spacing } : { "--spacing": "0.25rem" }) }]
  })
)
const base = buildTheme(DEFAULT_SPEC)

export default defineItem({
  name: "feel-auto",
  type: "registry:ui",
  title: "Feel Auto",
  description: "Picks the platform feel for you: macOS, iOS, Windows or web, from the device, before the first paint. All four feels are included and a user's override is remembered.",
  category: "foundation",
  tags: ["feel", "auto", "platform", "macos", "windows", "ios", "tauri", "electron", "detect"],
  files: [{ path: "components/feel-script.tsx" }],
  dependencies: [],
  registryDependencies: ["feel-presets"],
  cssVars: { theme: Object.fromEntries(Object.entries(base.theme).filter(([k]) => /^(shadow|text)-/.test(k))) },
  css: { ...blocks, ...feelRules() },
  docs: "Render <FeelScript /> once in <head> in your root layout and add suppressHydrationWarning to <html>. Use setFeel('macos' | 'ios' | 'windows' | 'web' | 'auto') from @/lib/ballmac/feel to let people choose.",
  ai: {
    summary: "Install once, render <FeelScript /> in <head>, and the whole app handles like the platform it runs on. A Tauri or Electron app on a Mac becomes macOS and the same app on Windows becomes Windows, with no code branches.",
    whenToUse: ["Desktop apps (Tauri, Electron) that ship to more than one OS", "Web apps that should feel native on phones and desktops"],
    whenNotToUse: ["Apps that always want one feel: install feel-macos, feel-ios or feel-windows instead", "Server components that must not read the platform: the feel is applied on the client before paint"],
    composesWith: ["app-window", "feel-presets"],
    customization: ["setFeel('auto') returns to the device's own feel", "The font is inherited from data-feel on <html>; apps that set their own font on <body> keep it"],
  },
  version: "1.0.0",
  updated: "2026-10-12",
})
