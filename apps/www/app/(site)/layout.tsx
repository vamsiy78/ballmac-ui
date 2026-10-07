import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1" data-gallery>{children}</main>
      <SiteFooter />
      {/* Page views and real-user speed for the site itself. Not in the root layout: the /preview pages are embedded as iframes all over the galleries and would be counted too. Vercel Analytics sets no cookies. */}
      {/* Only on Vercel (VERCEL_ENV is set there). The scripts are served from /_vercel/..., which exists nowhere else, so local and self-hosted builds would log two 404s and two script errors. */}
      {process.env.VERCEL_ENV ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
    </>
  )
}
