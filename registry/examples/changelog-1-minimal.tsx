import { Changelog1 } from "@/components/ballmac/blocks/changelog-1/changelog-1"

export default function Changelog1Minimal() {
  return (
    <Changelog1
      title="Release notes"
      description="Small updates, shipped often."
      feed={null}
      initialCount={5}
      releases={[
        { version: "0.9.2", date: "2026-09-26", title: "Keyboard shortcuts", changes: [{ type: "new", text: "Press ? anywhere to see every shortcut" }, { type: "fixed", text: "Shortcuts no longer fire while typing in a field" }] },
        { version: "0.9.1", date: "2026-09-11", title: "Faster startup", changes: [{ type: "improved", text: "The app opens in about half the time" }] },
        { version: "0.9.0", date: "2026-08-28", title: "Folders", changes: [{ type: "new", text: "Organise notes into nested folders" }, { type: "new", text: "Drag a note onto a folder to move it" }] },
      ]}
    />
  )
}
