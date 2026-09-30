import { FileTree } from "@/components/ballmac/file-tree"
export default function FileTreeStates() {
  return (
    <FileTree
      className="w-full max-w-xs"
      label="Documents"
      files={[
        {
          id: "reports",
          label: "Reports",
          type: "folder",
          children: [
            { id: "q3", label: "Q3 summary.md", type: "file", extension: "md" },
          ],
        },
        { id: "notes", label: "Notes.txt", type: "file", extension: "txt" },
      ]}
    />
  )
}
