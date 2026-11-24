import Link from "@/components/site/link"

import { BallmacMark } from "@/components/site/logo"

type FooterLink = { href: string; label: string }

/** The pages people look for at the foot of a page. The rest of the site is one click away in the header and the docs. */
const links: FooterLink[] = [
  { href: "/blocks", label: "Blocks" },
  { href: "/components", label: "Components" },
  { href: "/templates", label: "Templates" },
  { href: "/use-cases", label: "What you can build" },
  { href: "/compare", label: "Compare" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
  { href: "/support", label: "Support" },
  { href: "/affiliates", label: "Affiliates" },
  { href: "https://github.com/vamsiy78/ballmac-ui", label: "GitHub" },
  { href: "https://x.com/ballmacapps", label: "X" },
]

const cls = "hover:text-foreground focus-visible:ring-ring/50 rounded-sm outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none"

/** A quiet footer in the landing's spirit: the mark, one row of links, one line of small print. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-dashed">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-6 px-4 py-12 text-center sm:px-6">
        <Link href="/" className="focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-[3px]" aria-label="Ballmac UI home">
          <BallmacMark className="size-7" />
        </Link>
        <nav aria-label="Footer">
          <ul className="text-muted-foreground flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2.5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                {l.href.startsWith("http") ? <a href={l.href} className={cls}>{l.label}</a> : <Link href={l.href} className={cls}>{l.label}</Link>}
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-muted-foreground text-[13px]">
          © 2026 Ballmac · <Link href="/license/pro" className={cls}>Pro licence</Link> · <Link href="/refund" className={cls}>Refunds</Link> · <Link href="/license" className={cls}>MIT licence</Link>
        </p>
      </div>
    </footer>
  )
}
