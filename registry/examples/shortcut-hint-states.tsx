import { ShortcutHint } from "@/components/ballmac/shortcut-hint"
export default function ShortcutHintStates() {
  return (
    <div className="flex w-full max-w-xs flex-col items-start gap-3">
      <ShortcutHint compact label="Save" keys={["Ctrl", "S"]} />
      <ShortcutHint label="Open command menu" keys={["⇧", "⌘", "P"]} />
    </div>
  )
}
