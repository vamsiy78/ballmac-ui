import "server-only"

import { exportsOf, getAllItems, itemHref, readSource, SITE_URL, type SiteItem } from "@/lib/registry"

/** Public, versioned metadata for tools and agents (read by @ballmac/mcp). */
export const API_VERSION = 1

const kindOf = (i: SiteItem) => (i.category === "blocks" ? "block" : i.category === "templates" ? "template" : i.category === "foundation" ? "foundation" : "component")

export function summary(i: SiteItem) {
  return {
    name: i.name,
    kind: kindOf(i),
    type: i.type,
    title: i.title,
    description: i.description,
    category: i.category,
    blockCategory: i.blockCategory,
    tier: i.tier,
    tags: i.tags,
    version: i.version,
    updated: i.updated,
    url: `${SITE_URL}${i.category === "foundation" ? "/docs/theming" : itemHref(i)}`,
    registryUrl: `${SITE_URL}/r/${i.name}.json`,
    install: `npx shadcn@latest add @ballmac/${i.name}`,
    summary: i.ai?.summary,
    whenToUse: i.ai?.whenToUse ?? [],
    whenNotToUse: i.ai?.whenNotToUse ?? [],
    composesWith: i.ai?.composesWith ?? [],
    dependencies: i.dependencies,
    registryDependencies: i.registryDependencies,
    examples: i.examples.map((e) => e.name),
  }
}

export function detail(i: SiteItem) {
  const free = i.tier === "free"
  const main = i.files[0] ? readSource(i.files[0].source) : ""
  return {
    ...summary(i),
    exports: exportsOf(main),
    import: i.files[0] && !i.files[0].target.startsWith("app/") ? `import { ${exportsOf(main).join(", ")} } from "${i.files[0].target.replace(/^@(components|hooks|lib)\//, "@/$1/").replace(/\.tsx?$/, "")}"` : undefined,
    props: i.props,
    a11y: i.ai?.a11y ?? [],
    customization: i.ai?.customization ?? [],
    docs: i.docs,
    source: i.source,
    files: i.files.map((f) => ({ path: f.path, target: f.target, content: free ? readSource(f.source) : undefined })),
    exampleCode: i.examples.map((e) => ({ name: e.name, title: e.title, code: free ? readSource(e.source) : undefined })),
  }
}

export const allItems = getAllItems
