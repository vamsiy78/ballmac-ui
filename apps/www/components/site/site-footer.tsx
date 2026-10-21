import Link from "@/components/site/link"

import { FooterWordmark } from "@/components/site/footer-wordmark"
import { Logo } from "@/components/site/logo"

const columns = [
  {
    title: "Library",
    links: [
      { href: "/components", label: "Components" },
      { href: "/blocks", label: "Blocks" },
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
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/support", label: "Support" },
      { href: "/affiliates", label: "Affiliates · earn 30%" },
      { href: "/changelog", label: "Changelog" },
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/r/registry.json", label: "Registry JSON" },
    ],
  },
  {
    title: "Ballmac",
    links: [
      { href: "https://ballmac.com/services?ref=ui-footer", label: "Hire us" },
      { href: "https://ballmac.com", label: "ballmac.com" },
      { href: "https://ballmac.com/binzide", label: "Binzide" },
      { href: "https://x.com/ballmacapps", label: "X" },
      { href: "https://github.com/vamsiy78/ballmac-ui", label: "GitHub" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="col-span-2 space-y-3 md:col-span-1">
          <Logo />
          <p className="text-muted-foreground max-w-60 text-sm leading-relaxed">
            Polished React components from Ballmac, the team behind Binzide, Notchware and Sideme.
          </p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-medium">{c.title}</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("http") ? (
                    <a href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1440px] overflow-hidden px-4 sm:px-6">
        <FooterWordmark />
      </div>
      <div className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-[13px] sm:px-6">
          <p>© 2026 Ballmac</p>
          <span className="flex items-center gap-5">
            <Link href="/license/pro" className="hover:text-foreground transition-colors">
              Pro licence
            </Link>
            <Link href="/license" className="hover:text-foreground transition-colors">
              License
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
