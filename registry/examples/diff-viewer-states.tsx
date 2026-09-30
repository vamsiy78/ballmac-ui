import { DiffViewer } from "@/components/ballmac/diff-viewer"

export default function DiffViewerStates() {
  return (
    <DiffViewer
      className="w-full max-w-sm"
      label="release-notes.md"
      before={`## Changes
- Fixed search
- Updated docs`}
      after={`## Changes
- Fixed search
- Improved keyboard navigation
- Updated docs`}
      lineNumbers={false}
    />
  )
}
