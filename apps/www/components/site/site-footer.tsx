import Link from "next/link"

import { Logo } from "@/components/site/logo"

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-[1320px] flex-col gap-4 px-4 py-10 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo className="text-foreground" />
        <p>
          Free components are MIT licensed. Built by{" "}
          <a href="https://ballmac.com" className="text-foreground underline-offset-4 hover:underline">
            Ballmac
          </a>
          .
        </p>
        <div className="flex gap-4">
          <Link href="/docs/installation" className="hover:text-foreground">Docs</Link>
          <Link href="/llms.txt" className="hover:text-foreground">llms.txt</Link>
          <a href="https://x.com/ballmacapps" className="hover:text-foreground">X</a>
        </div>
      </div>
    </footer>
  )
}
