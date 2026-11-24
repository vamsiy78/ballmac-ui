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
      { href: "/compare", label: "Compare" },
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
  const cls = "hover:text-foreground focus-visible:ring-ring/50 rounded-sm outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"
  return href.startsWith("http") ? <a href={href} className={cls}>{children}</a> : <Link href={href} className={cls}>{children}</Link>
}

/** A quiet footer in the landing's palette: the links (every one kept, they are how people and crawlers find the rest), a faded wordmark and one line. */
export function SiteFooter() {
  const screens = getBlocks().length
  const freeScreens = getBlocks().filter((b) => !isPro(b)).length
  const components = getComponents().length
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-dashed">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Logo />
          <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
            {screens} app screens and {components} components for React and Tailwind. {freeScreens} screens are free under MIT; install any with the shadcn CLI and the code is yours.
          </p>
          {STANDING_PRICE && (
            <Link href="/pro?utm_source=ballmac-ui&utm_medium=footer&utm_campaign=pro" className="bg-frame hover:bg-frame/70 focus-visible:ring-ring/50 mt-5 inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">
              Pro, ${STANDING_PRICE} once
            </Link>
          )}
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="text-[13px] font-medium">{c.title}</h3>
            <ul className="text-muted-foreground mt-4 grid gap-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <FooterAnchor href={l.href}>{l.label}</FooterAnchor>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p aria-hidden="true" className="text-frame pointer-events-none -mb-[0.22em] text-center text-[clamp(5rem,21vw,19rem)] leading-none font-bold tracking-[-0.07em] select-none dark:text-white/[0.04]">
        Ballmac
      </p>
      <p className="text-muted-foreground relative border-t border-dashed px-4 py-5 text-center text-[13px]">
        © 2026 Ballmac · <Link href="/license/pro" className="hover:text-foreground">Pro licence</Link> · <Link href="/refund" className="hover:text-foreground">Refunds</Link> · <Link href="/license" className="hover:text-foreground">MIT licence</Link> · Designed and built by Ballmac
      </p>
    </footer>
  )
}
