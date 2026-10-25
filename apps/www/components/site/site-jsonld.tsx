import { JsonLd } from "@/components/site/json-ld"
import { faqPage, freeSoftware, ORG_ID, SITE_ID } from "@/lib/schema"
import { SITE_URL } from "@/lib/registry"

/** The organisation, the website, the library as software and the home page questions, for search and answer engines. Mounted on the home page only. */
export function SiteJsonLd({ faq, libraryDescription }: { faq: { q: string; text: string }[]; libraryDescription: string }) {
  const org = { "@type": "Organization", "@id": ORG_ID, name: "Ballmac", url: "https://ballmac.com", logo: `${SITE_URL}/apple-icon.png`, sameAs: ["https://x.com/ballmacapps", "https://github.com/vamsiy78/ballmac-ui", "https://www.youtube.com/@Ballmac"] }
  const site = { "@type": "WebSite", "@id": SITE_ID, name: "Ballmac UI", url: SITE_URL, description: "Accessible React and Tailwind components, blocks and templates with native-app motion, as a shadcn registry you and your AI agent install as code.", publisher: { "@id": ORG_ID }, inLanguage: "en" }
  return <JsonLd graph={[org, site, freeSoftware(libraryDescription), faqPage(faq)]} />
}
