import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { ThemeScript } from "@/components/site/theme-script"
import { SITE_URL } from "@/lib/registry"

import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Ballmac UI: React components your AI agent can install", template: "%s | Ballmac UI" },
  description:
    "Beautiful, accessible React and Tailwind components, blocks and templates. shadcn-compatible, installable from the CLI or your AI agent through MCP.",
  openGraph: { siteName: "Ballmac UI", type: "website" },
  twitter: { card: "summary_large_image", site: "@ballmacapps" },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
