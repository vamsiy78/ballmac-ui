import { TreeView } from "@/components/ballmac/tree-view"
const nodes = [
  {
    id: "workspace",
    label: "Workspace",
    children: [
      { id: "overview", label: "Overview" },
      {
        id: "analytics",
        label: "Analytics",
        children: [
          { id: "audience", label: "Audience" },
          { id: "revenue", label: "Revenue" },
        ],
      },
      { id: "settings", label: "Settings" },
    ],
  },
  { id: "help", label: "Help center" },
]
export default function TreeViewDemo() {
  return (
    <TreeView
      className="w-full max-w-xs"
      label="Workspace navigation"
      nodes={nodes}
      defaultExpandedIds={["workspace", "analytics"]}
      defaultSelectedId="audience"
    />
  )
}
