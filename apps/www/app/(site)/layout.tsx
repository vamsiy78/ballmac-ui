import { RecoveryOffer } from "@/components/pro/recovery-offer"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

// Cloudflare Web Analytics: no cookies, no personal data. The token is public (it is in the page); it comes from the Cloudflare dashboard, Web Analytics.
const cfBeacon = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1" data-gallery>{children}</main>
      <SiteFooter />
      <RecoveryOffer />
      {/* Page views for the site itself. Not in the root layout: the /preview pages are embedded as iframes all over the galleries and would be counted too. */}
      {cfBeacon ? <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: cfBeacon })} /> : null}
    </>
  )
}
