// Ballmac UI: File Tree. https://ui.ballmac.com/components/file-tree
"use client"

import * as React from "react"
import { FileCode2, FileText, Folder, FolderOpen } from "lucide-react"
import { TreeView, type TreeNode } from "@/components/ballmac/tree-view"

type FileNode = TreeNode & {
  /** Folder or file type. Folders can contain children. */
  type: "folder" | "file"
  /** Optional language or file extension used for the icon. */
  extension?: string
  /** Nested files and folders. */
  children?: FileNode[]
}
type FileTreeProps = Omit<
  React.ComponentProps<typeof TreeView>,
  "nodes" | "renderIcon" | "label"
> & {
  /** Files and folders to display. */
  files: FileNode[]
  /** Accessible name for the file tree. */
  label?: string
}
function FileTree({ files, label = "Files", ...props }: FileTreeProps) {
  return (
    <TreeView
      data-slot="file-tree"
      nodes={files}
      label={label}
      renderIcon={(node, expanded) => {
        const file = node as FileNode
        if (file.type === "folder")
          return expanded ? (
            <FolderOpen className="size-4" />
          ) : (
            <Folder className="size-4" />
          )
        return file.extension === "tsx" ||
          file.extension === "ts" ||
          file.extension === "js" ? (
          <FileCode2 className="size-4" />
        ) : (
          <FileText className="size-4" />
        )
      }}
      {...props}
    />
  )
}
export { FileTree, type FileTreeProps, type FileNode }
