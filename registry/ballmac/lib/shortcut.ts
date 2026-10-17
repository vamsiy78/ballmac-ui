// Ballmac UI: Shortcut. https://ui.ballmac.com/blocks/desktop-8
// Keyboard shortcuts as plain strings ("Mod+Shift+K"), written the way each platform writes them and recorded from key presses.
import type { FeelId } from "@/lib/ballmac/feel"

/** Modifier names in a shortcut string. Mod is ⌘ on a Mac and Ctrl everywhere else. */
export const MODIFIERS = ["Mod", "Ctrl", "Alt", "Shift"] as const

const macKeys: Record<string, string> = { Mod: "⌘", Ctrl: "⌃", Alt: "⌥", Shift: "⇧", Space: "Space", Enter: "↩", Backspace: "⌫", Tab: "⇥", Escape: "⎋", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" }
const pcKeys: Record<string, string> = { Mod: "Ctrl", Ctrl: "Ctrl", Alt: "Alt", Shift: "Shift", Escape: "Esc", ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right" }

const isModifier = (part: string) => (MODIFIERS as readonly string[]).includes(part)

/** Whether the feel writes shortcuts with Apple's symbols. */
export const usesMacKeys = (feel: FeelId) => feel === "macos" || feel === "ios"

/** Writes a shortcut the way the platform does: ⇧⌘Space on a Mac (modifiers in Apple's order, no separators), Ctrl+Shift+Space elsewhere. */
export function formatShortcut(shortcut: string, feel: FeelId) {
  if (!shortcut) return ""
  const parts = shortcut.split("+")
  const key = parts.find((p) => !isModifier(p)) ?? ""
  if (usesMacKeys(feel)) {
    const mods = ["Ctrl", "Alt", "Shift", "Mod"].filter((m) => parts.includes(m)).map((m) => macKeys[m])
    return mods.join("") + (macKeys[key] ?? key)
  }
  const mods = ["Mod", "Ctrl", "Alt", "Shift"].filter((m) => parts.includes(m)).map((m) => pcKeys[m])
  return [...new Set(mods), pcKeys[key] ?? key].join("+")
}

/** The same shortcut in one canonical order, so two spellings of one combination compare equal. On Windows and the web Mod and Ctrl are one key. */
export function normalizeShortcut(shortcut: string, feel: FeelId = "web") {
  if (!shortcut) return ""
  const parts = shortcut.split("+").map((p) => (!usesMacKeys(feel) && p === "Ctrl" ? "Mod" : p))
  const key = parts.find((p) => !isModifier(p)) ?? ""
  return [...MODIFIERS.filter((m) => parts.includes(m)), key.length === 1 ? key.toUpperCase() : key].join("+")
}

/**
 * Turns a key press into a shortcut string, or null while only modifiers are down. With `requireModifier` (the default) a plain
 * letter is refused, so a global shortcut cannot take a key from every other app.
 */
export function shortcutFromEvent(
  e: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">,
  mac: boolean,
  requireModifier = true
): string | null {
  if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return null
  const mods: string[] = []
  if (mac ? e.metaKey : e.ctrlKey) mods.push("Mod")
  if (mac && e.ctrlKey) mods.push("Ctrl")
  if (e.altKey) mods.push("Alt")
  if (e.shiftKey) mods.push("Shift")
  if (requireModifier && !mods.length) return null
  // e.code keeps Option+letter on a Mac from turning into a symbol such as "˚"
  const fromCode = /^Key([A-Z])$/.exec(e.code)?.[1] ?? /^Digit(\d)$/.exec(e.code)?.[1]
  const key = e.code === "Space" ? "Space" : (fromCode ?? (e.key.length === 1 ? e.key.toUpperCase() : e.key))
  return [...mods, key].join("+")
}
