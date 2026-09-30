// Ballmac UI: Tree View. https://ui.ballmac.com/components/tree-view
"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type TreeNode = {
  /** Stable node identifier. */
  id: string
  /** Visible node label. */
  label: string
  /** Nested children. */
  children?: TreeNode[]
  /** Disable selection for this node. */
  disabled?: boolean
}
type TreeViewProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** Hierarchical nodes to display. */
  nodes: TreeNode[]
  /** Accessible name for the tree. */
  label: string
  /** Controlled selected node ID. */
  selectedId?: string
  /** Initial selected node ID. */
  defaultSelectedId?: string
  /** Called when selection changes. */
  onSelectedIdChange?: (id: string) => void
  /** Controlled expanded IDs. */
  expandedIds?: string[]
  /** Initially expanded IDs. */
  defaultExpandedIds?: string[]
  /** Called when expansion changes. */
  onExpandedIdsChange?: (ids: string[]) => void
  /** Optional icon for each node. */
  renderIcon?: (node: TreeNode, expanded: boolean) => React.ReactNode
}
type VisibleNode = {
  node: TreeNode
  depth: number
  parent?: string
  position: number
  siblingCount: number
}

function TreeView({
  className,
  nodes,
  label,
  selectedId,
  defaultSelectedId,
  onSelectedIdChange,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedIdsChange,
  renderIcon,
  ...props
}: TreeViewProps) {
  const [internalSelected, setInternalSelected] = React.useState(
    defaultSelectedId ?? nodes[0]?.id,
  )
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpandedIds)
  const selection = selectedId ?? internalSelected
  const expanded = expandedIds ?? internalExpanded
  const expandedSet = new Set(expanded)
  const visible: VisibleNode[] = []
  function add(items: TreeNode[], depth: number, parent?: string) {
    items.forEach((node, index) => {
      visible.push({
        node,
        depth,
        parent,
        position: index + 1,
        siblingCount: items.length,
      })
      if (node.children?.length && expandedSet.has(node.id))
        add(node.children, depth + 1, node.id)
    })
  }
  add(nodes, 1)
  const tabbableId = visible.some(
    (entry) => entry.node.id === selection && !entry.node.disabled,
  )
    ? selection
    : visible.find((entry) => !entry.node.disabled)?.node.id
  const refMap = React.useRef(new Map<string, HTMLDivElement>())
  const focus = (id: string) => refMap.current.get(id)?.focus()
  function select(id: string) {
    if (selectedId === undefined) setInternalSelected(id)
    onSelectedIdChange?.(id)
  }
  function toggle(id: string, open?: boolean) {
    const next = expandedSet.has(id)
      ? open === true
        ? expanded
        : expanded.filter((item) => item !== id)
      : open === false
        ? expanded
        : [...expanded, id]
    if (expandedIds === undefined) setInternalExpanded(next)
    onExpandedIdsChange?.(next)
  }
  function onKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    current: VisibleNode,
    index: number,
  ) {
    const children = current.node.children?.length ?? 0
    let next: string | undefined
    if (event.key === "ArrowDown")
      next = visible.slice(index + 1).find((entry) => !entry.node.disabled)
        ?.node.id
    else if (event.key === "ArrowUp")
      next = [...visible.slice(0, index)]
        .reverse()
        .find((entry) => !entry.node.disabled)?.node.id
    else if (event.key === "Home")
      next = visible.find((entry) => !entry.node.disabled)?.node.id
    else if (event.key === "End")
      next = [...visible].reverse().find((entry) => !entry.node.disabled)
        ?.node.id
    else if (event.key === "ArrowRight" && children) {
      if (!expandedSet.has(current.node.id)) toggle(current.node.id, true)
      else next = current.node.children?.find((child) => !child.disabled)?.id
    } else if (event.key === "ArrowLeft") {
      if (children && expandedSet.has(current.node.id))
        toggle(current.node.id, false)
      else next = current.parent
    } else if (event.key === "Enter" || event.key === " ") {
      select(current.node.id)
      if (children) toggle(current.node.id)
    } else return
    event.preventDefault()
    if (next) {
      select(next)
      focus(next)
    }
  }
  return (
    <div
      data-slot="tree-view"
      role="tree"
      aria-label={label}
      className={cn(
        "min-w-0 rounded-xl border border-border bg-card p-1",
        className,
      )}
      {...props}
    >
      {visible.map((entry, index) => {
        const { node, depth } = entry
        const hasChildren = Boolean(node.children?.length)
        const isExpanded = expandedSet.has(node.id)
        return (
          <div
            key={node.id}
            ref={(element) => {
              if (element) refMap.current.set(node.id, element)
              else refMap.current.delete(node.id)
            }}
            data-slot="tree-view-item"
            role="treeitem"
            aria-level={depth}
            aria-posinset={entry.position}
            aria-setsize={entry.siblingCount}
            aria-selected={selection === node.id}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-disabled={node.disabled || undefined}
            tabIndex={tabbableId === node.id ? 0 : -1}
            onClick={() => {
              if (!node.disabled) {
                select(node.id)
                focus(node.id)
              }
            }}
            onDoubleClick={() => {
              if (hasChildren) toggle(node.id)
            }}
            onKeyDown={(event) => {
              if (!node.disabled) onKeyDown(event, entry, index)
            }}
            className={cn(
              "flex min-h-9 cursor-default items-center gap-1 rounded-md pr-2 text-sm outline-none transition-colors duration-150 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
              selection === node.id && "bg-accent text-accent-foreground",
              node.disabled && "pointer-events-none opacity-50",
            )}
            style={{ paddingInlineStart: `${(depth - 1) * 16 + 8}px` }}
          >
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center"
            >
              {hasChildren && (
                <ChevronRight
                  className={cn(
                    "size-3.5 transition-transform duration-150 motion-reduce:transition-none",
                    isExpanded && "rotate-90",
                  )}
                />
              )}
            </span>
            {renderIcon && (
              <span
                aria-hidden="true"
                className="text-muted-foreground flex size-4 shrink-0 items-center justify-center"
              >
                {renderIcon(node, isExpanded)}
              </span>
            )}
            <span className="min-w-0 truncate">{node.label}</span>
          </div>
        )
      })}
    </div>
  )
}
export { TreeView, type TreeViewProps, type TreeNode }
