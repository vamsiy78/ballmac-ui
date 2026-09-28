import { itemHref, SITE_URL, type SiteItem } from "@/lib/registry"

/** SoftwareSourceCode + breadcrumbs for an item page. */
export function ItemJsonLd({ item, section }: { item: SiteItem; section: { name: string; path: string } }) {
  const url = `${SITE_URL}${itemHref(item)}`
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        name: `${item.title} (Ballmac UI)`,
        description: item.description,
        url,
        codeRepository: "https://github.com/vamsiy78/ballmac-ui",
        programmingLanguage: ["TypeScript", "React"],
        runtimePlatform: "React 19, Tailwind CSS v4",
        license: item.tier === "free" ? "https://opensource.org/licenses/MIT" : `${SITE_URL}/docs/licensing`,
        version: item.version,
        dateModified: item.updated,
        keywords: item.tags.join(", "),
        publisher: { "@type": "Organization", name: "Ballmac", url: "https://ballmac.com" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: section.name, item: `${SITE_URL}${section.path}` },
          { "@type": "ListItem", position: 2, name: item.title, item: url },
        ],
      },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}
