import { fileURLToPath } from "node:url"

import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

import docsRedirects from "./content/docs-redirects.json"

/**
 * Two ways to build:
 *   BALLMAC_EXPORT=1 next build   the site as static files in out/, for Cloudflare (see wrangler.jsonc). Headers and redirects then come from
 *                                 cloudflare/_headers and cloudflare/_redirects, and the routes that need a request run in the Worker (worker/).
 *   next dev / next build         a Node server, for development. The Worker's routes are proxied to `pnpm cf:worker` (wrangler dev, port 8787).
 */
const exportBuild = process.env.BALLMAC_EXPORT === "1"
const WORKER_DEV = process.env.BALLMAC_WORKER_URL || "http://127.0.0.1:8787"
// Keep in step with run_worker_first in wrangler.jsonc.
const workerRoutes = ["/go/:code", "/api/affiliates", "/api/affiliates/:path*", "/api/changelog-subscribe", "/api/checkout-click", "/api/docs-feedback", "/api/pro/:path*", "/api/reminders", "/api/sampler", "/api/stars", "/api/support", "/api/v1/license/:path*", "/api/v1/preset", "/r/pro/:path*", "/r/registry.json", "/r/:file(preset-.+)", "/r/:file(base-.+)", "/r/:style((?!pro$|base$|tests$)[a-z0-9-]+)/:file(.+\\.json)", "/themes/custom.json"]

// Shaders in the private Pro blocks are strings, which the minifier leaves as written; this shrinks them in the public bundles (see the loader).
const glslLoader = fileURLToPath(new URL("./scripts/glsl-minify-loader.cjs", import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.tsx": { condition: { all: [{ path: /registry\/pro\/ballmac\// }, { content: /void\s+main\s*\(/ }] }, loaders: [glslLoader], as: "*" },
    },
  },
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: ["@ballmac-ui/metadata", "@ballmac-ui/theme-engine"],
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  ...(exportBuild ? { output: "export", images: { unoptimized: true } } : {}),
}

if (!exportBuild) {
  nextConfig.rewrites = async () => workerRoutes.map((source) => ({ source, destination: `${WORKER_DEV}${source}` }))
  nextConfig.redirects = async function redirects() {
    return [
      { source: "/docs/licensing", destination: "/license", permanent: true },
      // Docs pages that moved when the docs were organised by what the reader needs; see content/docs-redirects.json. cloudflare/_redirects gets the same list in worker/postbuild.mts.
      ...Object.entries(docsRedirects).map(([source, destination]) => ({ source, destination, permanent: true })),
    ]
  }
  nextConfig.headers = async function headers() {
    return [
      {
        // Free registry items: public, cacheable, and fetchable cross-origin by the shadcn CLI and v0.
        // Free registry JSON is public and cached at the edge. /r/pro/* is licensed per request and must never be.
        source: "/r/:path((?!pro/).*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/r/pro/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Vary", value: "Authorization" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Only this site may frame its pages (the previews are same-origin iframes); no plugins; forms post to this site only.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Camera and microphone stay available to this site because the voice and recording component previews use them.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()" },
        ],
      },
    ]
  }
}

export default createMDX()(nextConfig)
