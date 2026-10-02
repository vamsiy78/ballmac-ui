import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@ballmac-ui/metadata", "@ballmac-ui/theme-engine"],
  productionBrowserSourceMaps: false,
  // The private Pro registry route reads the Pro build from disk at request time.
  outputFileTracingIncludes: { "/r/pro/\\[name\\]": ["./.registry-pro/**/*"] },
  async redirects() {
    return [{ source: "/docs/licensing", destination: "/license", permanent: true }]
  },
  async headers() {
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
        ],
      },
    ]
  },
}

export default nextConfig
