import { FileTree } from "@/components/ballmac/file-tree"
export default function FileTreeDemo() {
  return (
    <FileTree
      className="w-full max-w-xs"
      label="Project files"
      defaultExpandedIds={["src", "app"]}
      defaultSelectedId="dashboard"
      files={[
        {
          id: "src",
          label: "src",
          type: "folder",
          children: [
            {
              id: "app",
              label: "app",
              type: "folder",
              children: [
                {
                  id: "dashboard",
                  label: "dashboard.tsx",
                  type: "file",
                  extension: "tsx",
                },
                {
                  id: "layout",
                  label: "layout.tsx",
                  type: "file",
                  extension: "tsx",
                },
              ],
            },
            {
              id: "components",
              label: "components",
              type: "folder",
              children: [
                {
                  id: "chart",
                  label: "chart.tsx",
                  type: "file",
                  extension: "tsx",
                },
              ],
            },
          ],
        },
        { id: "readme", label: "README.md", type: "file", extension: "md" },
      ]}
    />
  )
}
