import { DiffViewer } from "@/components/ballmac/diff-viewer"
const before = `export const settings = {
  theme: "light",
  notifications: false,
  autoSave: true,
}`
const after = `export const settings = {
  theme: "system",
  notifications: true,
  autoSave: true,
}`
export default function DiffViewerDemo() {
  return (
    <DiffViewer
      className="w-full max-w-md"
      label="settings.ts"
      before={before}
      after={after}
    />
  )
}
