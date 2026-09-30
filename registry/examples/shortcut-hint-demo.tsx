import { ShortcutHint } from "@/components/ballmac/shortcut-hint"
export default function ShortcutHintDemo() {
  return (
    <div className="bg-card flex w-full max-w-xs flex-col gap-1 rounded-xl border border-border p-2 shadow-sm">
      <div className="hover:bg-accent rounded-md px-3 py-2">
        <ShortcutHint
          className="w-full justify-between"
          label="Search anything"
          keys={["⌘", "K"]}
        />
      </div>
      <div className="hover:bg-accent rounded-md px-3 py-2">
        <ShortcutHint
          className="w-full justify-between"
          label="Create project"
          keys={["⌘", "N"]}
        />
      </div>
    </div>
  )
}
