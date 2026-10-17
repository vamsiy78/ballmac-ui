import { describe, expect, it } from "vitest"

import { formatShortcut, normalizeShortcut, shortcutFromEvent } from "@/lib/ballmac/shortcut"

const key = (k: Partial<KeyboardEvent>) => ({ key: "", code: "", metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...k })

describe("shortcut", () => {
  it("writes each platform's notation", () => {
    expect(formatShortcut("Mod+Shift+K", "macos")).toBe("⇧⌘K")
    expect(formatShortcut("Ctrl+Alt+Mod+Escape", "macos")).toBe("⌃⌥⌘⎋")
    expect(formatShortcut("Mod+Shift+K", "windows")).toBe("Ctrl+Shift+K")
    expect(formatShortcut("Mod+Ctrl+K", "web")).toBe("Ctrl+K")
  })

  it("normalizes spellings so conflicts are found", () => {
    expect(normalizeShortcut("Shift+Mod+k")).toBe("Mod+Shift+K")
    expect(normalizeShortcut("Ctrl+P", "windows")).toBe(normalizeShortcut("Mod+P", "windows"))
    expect(normalizeShortcut("Ctrl+P", "macos")).not.toBe(normalizeShortcut("Mod+P", "macos"))
  })

  it("records key presses, ignoring lone modifiers and Option symbols", () => {
    expect(shortcutFromEvent(key({ key: "Meta", metaKey: true }), true)).toBeNull()
    expect(shortcutFromEvent(key({ key: "˚", code: "KeyK", metaKey: true, altKey: true }), true)).toBe("Mod+Alt+K")
    expect(shortcutFromEvent(key({ key: "k", code: "KeyK", ctrlKey: true }), false)).toBe("Mod+K")
    expect(shortcutFromEvent(key({ key: " ", code: "Space", ctrlKey: true, shiftKey: true }), false)).toBe("Mod+Shift+Space")
    expect(shortcutFromEvent(key({ key: "k", code: "KeyK" }), true)).toBeNull()
    expect(shortcutFromEvent(key({ key: "k", code: "KeyK" }), true, false)).toBe("K")
  })
})
