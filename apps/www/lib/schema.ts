/**
 * Structured data (schema.org JSON-LD) and title helpers for search engines and answer engines. Pure functions, so they can be tested;
 * components/site/json-ld.tsx renders them. Every value here must match what the page shows: no prices, dates or claims that are not on it.
 */
import { SITE_URL } from "./site-url"

export const ORG_ID = `${SITE_URL}/#org`
export const SITE_ID = `${SITE_URL}/#site`

type Node = Record<string, unknown>

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`)

/** A page title short enough that "<title> | Ballmac UI" stays within 70 characters: cut at a colon, comma or "and" when there is one. */
export function fitTitle(title: string, max = 56): string {
  if (title.length <= max) return title
  const head = title.slice(0, max + 1)
  for (const cut of [":", ",", " and "]) {
    const at = head.lastIndexOf(cut)
    if (at >= 20) return title.slice(0, at).trim()
  }
  const at = head.lastIndexOf(" ")
  return `${title.slice(0, at > 0 ? at : max).trim()}…`
}

export function breadcrumbs(trail: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: abs(t.path) })),
  }
}

/** Question and answer pairs as plain text, as written on the page. */
export function faqPage(items: { q: string; text: string }[]): Node {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.text } })),
  }
}

export function article(a: { type?: "TechArticle" | "BlogPosting" | "Article"; headline: string; description?: string; path: string; published?: string; modified?: string; section?: string }): Node {
  return {
    "@type": a.type ?? "Article",
    headline: a.headline,
    ...(a.description ? { description: a.description } : {}),
    url: abs(a.path),
    mainEntityOfPage: abs(a.path),
    ...(a.published ? { datePublished: a.published } : {}),
    ...((a.modified ?? a.published) ? { dateModified: a.modified ?? a.published } : {}),
    ...(a.section ? { articleSection: a.section } : {}),
    inLanguage: "en",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
  }
}

export function collection(c: { name: string; description: string; path: string; items: { name: string; path: string }[] }): Node[] {
  return [
    { "@type": "CollectionPage", name: c.name, description: c.description, url: abs(c.path), isPartOf: { "@id": SITE_ID }, publisher: { "@id": ORG_ID } },
    {
      "@type": "ItemList",
      numberOfItems: c.items.length,
      itemListElement: c.items.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name, url: abs(i.path) })),
    },
  ]
}

/** The free library as software, and what it costs: nothing. */
export function freeSoftware(description: string): Node {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#library`,
    name: "Ballmac UI",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (React 19, Tailwind CSS v4)",
    description,
    url: SITE_URL,
    license: `${SITE_URL}/license`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    publisher: { "@id": ORG_ID },
  }
}

/** Pro and Team as one product with an offer each. Only call it for prices that are on sale and shown on the page. */
export function proProduct(p: { path: string; description: string; pro: { price: string; url?: string }; team: { price: string; seats: number; url?: string } }): Node {
  const offer = (name: string, price: string, url: string | undefined, seats?: number): Node => ({
    "@type": "Offer",
    name,
    price: String(Number(price)),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: url ?? abs(p.path),
    ...(seats ? { eligibleQuantity: { "@type": "QuantitativeValue", value: seats, unitText: "seats" } } : {}),
    seller: { "@id": ORG_ID },
  })
  return {
    "@type": "Product",
    "@id": `${abs(p.path)}#pro`,
    name: "Ballmac UI Pro",
    description: p.description,
    url: abs(p.path),
    brand: { "@type": "Brand", name: "Ballmac" },
    category: "React UI blocks",
    offers: [offer("Pro, one person", p.pro.price, p.pro.url), offer(`Team, up to ${p.team.seats} people`, p.team.price, p.team.url, p.team.seats)],
  }
}
