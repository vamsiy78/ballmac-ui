import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/registry"

// Built once with the site (the Cloudflare build is static).
export const dynamic = "force-static"

const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "meta-externalagent", "CCBot", "Amazonbot", "cohere-ai", "MistralAI-User"]

export default function robots(): MetadataRoute.Robots {
  // Previews (preprod.ui.ballmac.com, *.workers.dev) are never indexed; their pages also send X-Robots-Tag: noindex (worker/postbuild.mts).
  if (process.env.DEPLOY_ENV !== "production" && process.env.DEPLOY_ENV) return { rules: { userAgent: "*", disallow: "/" } }
  return {
    // Search and AI crawlers are welcome on the free library and the docs (it is MIT licensed, and llms.txt is written for them). Pro source is never public.
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/preview/"] },
      { userAgent: AI_CRAWLERS, allow: ["/", "/llms.txt", "/llms-full.txt", "/md/"], disallow: ["/preview/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
