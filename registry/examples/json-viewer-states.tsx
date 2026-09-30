import { JsonViewer } from "@/components/ballmac/json-viewer"
export default function JsonViewerStates() {
  return (
    <JsonViewer
      className="w-full max-w-sm"
      value={[
        { id: "evt_001", status: "complete" },
        { id: "evt_002", status: "pending" },
      ]}
      label="Recent events JSON"
      defaultExpandedDepth={1}
    />
  )
}
