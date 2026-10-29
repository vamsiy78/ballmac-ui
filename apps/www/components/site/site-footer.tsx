import Link from "@/components/site/link"

import { Logo } from "@/components/site/logo"
import { BUILT_WITH } from "@/lib/built-with"
import { STANDING_PRICE } from "@/lib/limited-offer"
import { getBlocks, getComponents, isPro } from "@/lib/registry"

type FooterLink = { href: string; label: string }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Library",
    links: [
      { href: "/blocks", label: "Blocks" },
      { href: "/components", label: "Components" },
      { href: "/templates", label: "Templates" },
      { href: "/charts", label: "Charts" },
      { href: "/presets", label: "Presets" },
      { href: "/themes", label: "Themes" },
      { href: "/use-cases", label: "What you can build" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Docs",
    links: [
      { href: "/docs/get-started/install", label: "Installation" },
      { href: "/docs/get-started/make-it-yours", label: "Theming" },
      { href: "/docs/reference/registry", label: "CLI & registry" },
      { href: "/docs/get-started/connect-your-agent", label: "MCP & AI agents" },
      { href: "/quality", label: "Quality, measured" },
      { href: "/verified", label: "Ballmac Verified" },
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/r/registry.json", label: "Registry JSON" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/support", label: "Support" },
      { href: "/changelog", label: "Changelog" },
      { href: "/affiliates", label: "Affiliates, earn 30%" },
      { href: "/contribute", label: "Contribute" },
      ...(BUILT_WITH.length > 0 ? [{ href: "/built-with", label: "Built with Ballmac UI" }] : []),
      { href: "https://ballmac.com/services?ref=ui-footer", label: "Hire us" },
      { href: "https://x.com/ballmacapps", label: "X" },
      { href: "https://github.com/vamsiy78/ballmac-ui", label: "GitHub" },
    ],
  },
]

function FooterAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  return href.startsWith("http") ? <a href={href}>{children}</a> : <Link href={href}>{children}</Link>
}

export function SiteFooter() {
  const screens = getBlocks().length
  const freeScreens = getBlocks().filter((b) => !isPro(b)).length
  const components = getComponents().length
  return (
    <footer className="bm-footer">
      <div className="bm-footer__stage" aria-hidden="true">
        <div className="bm-grain absolute inset-0" />
      </div>
      <p className="bm-footer__wordmark" aria-hidden="true">Ballmac</p>
      <div className="bm-footer__fog" aria-hidden="true" />
      <div className="bm-footer__content">
        <div className="bm-footer__brand">
          <Logo />
          <h2 className="bm-footer__title">Real app screens, one command away</h2>
          <p className="bm-footer__text">
            Finished screens and components for React and Tailwind, from billing to AI agent consoles. Install one with the shadcn CLI and the code is yours.
          </p>
          <Link href="/blocks" className="bm-footer__cta">
            Browse screens
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:-scale-x-100">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          {STANDING_PRICE && <Link href="/pro?utm_source=ballmac-ui&utm_medium=footer&utm_campaign=pro" className="bm-footer__pro">Pro, ${STANDING_PRICE} once →</Link>}
          <p className="bm-footer__copy">
            © 2026 Ballmac · <Link href="/license/pro">Pro licence</Link> · <Link href="/refund">Refunds</Link> · <Link href="/license">MIT licence</Link>
          </p>
          <ul className="bm-footer__status" aria-label="The library in numbers">
            <li className="bm-footer__chip"><span className="bm-footer__dot" aria-hidden="true" />{freeScreens} free screens</li>
            <li className="bm-footer__chip">{screens} screens in all</li>
            <li className="bm-footer__chip">{components} components</li>
          </ul>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="bm-footer__col-title">{c.title}</h3>
            <ul className="bm-footer__list">
              {c.links.map((l) => (
                <li key={l.href}><FooterAnchor href={l.href}>{l.label}</FooterAnchor></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  )
}
