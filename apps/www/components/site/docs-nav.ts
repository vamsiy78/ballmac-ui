import type { Root, Node } from "fumadocs-core/page-tree"

import { source } from "@/lib/docs-source"
import type { NavGroup, NavLink } from "@/lib/registry"

/** The rest of the site, listed under the docs in the sidebar. */
export const browseNav: NavGroup = {
  title: "Browse",
  items: [
    { href: "/components", label: "All components" },
    { href: "/blocks", label: "Blocks" },
    { href: "/templates", label: "Templates" },
    { href: "/charts", label: "Charts" },
    { href: "/presets", label: "Presets" },
    { href: "/themes", label: "Theme builder" },
    { href: "/feels", label: "Platform feels" },
    { href: "/quality", label: "Quality, measured" },
    { href: "/changelog", label: "Changelog" },
    { href: "/support", label: "Support" },
  ],
}

const text = (v: unknown) => (typeof v === "string" ? v : String(v ?? ""))

/**
 * The docs groups, built from content/docs: the loose pages at the top become "Overview", and each folder (Get started, Guides, Reference,
 * Concepts, in the order of its meta.json) becomes a group of its pages. Pages generated from code are marked in the folder's own meta.
 */
export function docsGroups(): NavGroup[] {
  const root = source.pageTree as Root
  const pages = (nodes: Node[]): NavLink[] =>
    nodes.flatMap((n) => (n.type === "page" ? [{ href: n.url, label: text(n.name) }] : n.type === "folder" ? [...(n.index ? [{ href: n.index.url, label: text(n.index.name) }] : []), ...pages(n.children)] : []))
  const loose = pages(root.children.filter((n) => n.type === "page"))
  const folders = root.children.filter((n) => n.type === "folder").map((n) => ({ title: text(n.name), items: pages(n.type === "folder" ? n.children : []) }))
  return [...(loose.length ? [{ title: "Overview", items: loose }] : []), ...folders]
}
