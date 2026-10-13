import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/registry"

// Built once with the site (the Cloudflare build is static).
export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  // Previews (preprod.ui.ballmac.com, *.workers.dev) are never indexed; their pages also send X-Robots-Tag: noindex (worker/postbuild.mts).
  if (process.env.DEPLOY_ENV !== "production" && process.env.DEPLOY_ENV) return { rules: { userAgent: "*", disallow: "/" } }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/preview/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
