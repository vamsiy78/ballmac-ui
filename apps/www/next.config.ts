import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@ballmac-ui/metadata"],
  productionBrowserSourceMaps: false,
  async redirects() {
    return [{ source: "/docs/licensing", destination: "/license", permanent: true }]
  },
  async headers() {
    return [
      {
        // Free registry items: public, cacheable, and fetchable cross-origin by the shadcn CLI and v0.
        source: "/r/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
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
