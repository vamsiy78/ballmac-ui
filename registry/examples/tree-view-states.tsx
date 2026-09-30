import { TreeView } from "@/components/ballmac/tree-view"
export default function TreeViewStates() {
  return (
    <TreeView
      className="w-full max-w-xs"
      label="Documentation"
      nodes={[
        {
          id: "guide",
          label: "Guide",
          children: [
            { id: "start", label: "Getting started" },
            { id: "api", label: "API reference" },
          ],
        },
        { id: "archive", label: "Archived", disabled: true },
      ]}
      defaultExpandedIds={["guide"]}
    />
  )
}
