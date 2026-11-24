import Link from "@/components/site/link"

import { CommandMenu } from "@/components/site/command-menu"
import { sidebarGroups } from "@/components/site/docs-shell"
import { Logo } from "@/components/site/logo"
import { MainNav } from "@/components/site/main-nav"
import { MobileNav } from "@/components/site/mobile-nav"
import { ProAccount } from "@/components/pro/pro-account"
import { ThemeToggle } from "@/components/site/theme-toggle"

/**
 * A floating pill instead of a full-width bar: the page runs edge to edge under it. The outer band is still 3.5rem tall, so the sticky sub-navs and the
 * docs sidebar that sit at top-14 line up under it as before. The band itself lets clicks through; only the pill takes them.
 */
export function SiteHeader() {
  return (
    <header className="pointer-events-none sticky top-0 z-40 h-14 px-2 pt-2 sm:px-4">
      <div className="bg-frame/85 pointer-events-auto mx-auto flex h-12 max-w-[820px] items-center gap-1 rounded-2xl ps-2 pe-2 shadow-[0_1px_0_rgb(255_255_255/0.6)_inset,0_8px_24px_-12px_rgb(0_0_0/0.18)] ring-1 ring-black/[0.04] backdrop-blur-xl sm:ps-4 dark:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)] dark:ring-white/[0.06]">
        <MobileNav groups={sidebarGroups()} />
        <Link href="/" className="focus-visible:ring-ring/50 me-2 flex items-center rounded-lg outline-none focus-visible:ring-[3px]">
          <span className="sr-only">Ballmac UI home</span>
          <span aria-hidden="true" className="flex">
            <Logo />
          </span>
        </Link>
        <div className="ms-auto flex items-center gap-1.5">
          <MainNav />
          <CommandMenu compact />
          <ThemeToggle className="bg-background text-foreground hover:bg-background/70 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-lg shadow-[0_1px_2px_rgb(0_0_0/0.06)] outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none" />
          <ProAccount className="ms-1" />
        </div>
      </div>
    </header>
  )
}
