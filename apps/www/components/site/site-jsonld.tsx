import { SITE_URL } from "@/lib/registry"

/** The organisation and the website, for search engines. Mounted on the home page only. */
export function SiteJsonLd() {
  const org = { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "Ballmac", url: "https://ballmac.com", logo: `${SITE_URL}/apple-icon.png`, sameAs: ["https://x.com/ballmacapps", "https://github.com/vamsiy78/ballmac-ui", "https://www.youtube.com/@Ballmac"] }
  const site = { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: "Ballmac UI", url: SITE_URL, description: "Accessible React and Tailwind components, blocks and templates with native-app motion, as a shadcn registry you and your AI agent install as code.", publisher: { "@id": `${SITE_URL}/#org` }, inLanguage: "en" }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [org, site] }).replace(/</g, "\\u003c") }} />
}
