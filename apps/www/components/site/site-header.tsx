import Link from "@/components/site/link"

import { CommandMenu } from "@/components/site/command-menu"
import { sidebarGroups } from "@/components/site/docs-shell"
import { GithubStars } from "@/components/site/github-stars"
import { Logo } from "@/components/site/logo"
import { MainNav } from "@/components/site/main-nav"
import { MobileNav } from "@/components/site/mobile-nav"
import { starsAtBuild } from "@/lib/github-stars-build"
import { ProAccount } from "@/components/pro/pro-account"
import { ThemeToggle } from "@/components/site/theme-toggle"

export async function SiteHeader() {
  const stars = await starsAtBuild()
  return (
    <header className="bg-background sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-4 sm:px-6">
        <MobileNav groups={sidebarGroups()} />
        <Link href="/" className="focus-visible:ring-ring/50 me-3 flex items-center rounded-md outline-none focus-visible:ring-[3px]">
          <span className="sr-only">Ballmac UI home</span>
          <span aria-hidden="true" className="flex">
            <Logo />
          </span>
        </Link>
        <MainNav />
        <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-1">
          <div className="me-1 min-w-0 sm:w-full sm:max-w-72 xl:max-w-48 2xl:max-w-72">
            <CommandMenu />
          </div>
          <GithubStars initial={stars} />
          <a
            href="https://x.com/ballmacapps"
            className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 hidden size-8 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] sm:inline-flex"
            aria-label="Ballmac on X"
          >
            <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
              <path d="M18.9 1.2h3.7l-8 9.1 9.4 12.5h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.4h2L6.5 3.3H4.3l13.3 17.3Z" />
            </svg>
          </a>
          <ThemeToggle />
          <ProAccount className="ms-1" />
        </div>
      </div>
    </header>
  )
}
