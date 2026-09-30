import { JsonViewer } from "@/components/ballmac/json-viewer"
const response = {
  workspace: "Product design",
  active: true,
  members: 12,
  features: { analytics: true, exports: ["csv", "pdf"] },
  updatedAt: null,
}
export default function JsonViewerDemo() {
  return (
    <JsonViewer
      className="w-full max-w-sm"
      value={response}
      label="Workspace API response"
      defaultExpandedDepth={2}
    />
  )
}
