import { KeyboardShortcuts } from "@/components/ballmac/keyboard-shortcuts"

export default function KeyboardShortcutsDemo() {
  return (
    <div className="w-full max-w-2xl rounded-xl border bg-card p-5">
      <KeyboardShortcuts
        groups={[
          {
            title: "General",
            shortcuts: [
              { label: "Open command menu", keys: ["Mod", "K"] },
              { label: "Show shortcuts", keys: ["?"] },
              { label: "Toggle sidebar", keys: ["Mod", "B"] },
              { label: "Save", keys: ["Mod", "S"] },
            ],
          },
          {
            title: "Navigation",
            shortcuts: [
              { label: "Go to inbox", keys: ["G", "I"], sequence: true },
              { label: "Go to projects", keys: ["G", "P"], sequence: true },
              { label: "Next item", keys: ["J"] },
              { label: "Previous item", keys: ["K"] },
            ],
          },
          {
            title: "Editing",
            shortcuts: [
              { label: "Bold", keys: ["Mod", "B"] },
              { label: "Move line up", keys: ["Alt", "Up"] },
              { label: "Duplicate line", keys: ["Shift", "Alt", "Down"] },
              { label: "Undo", keys: ["Mod", "Z"] },
            ],
          },
        ]}
      />
    </div>
  )
}
