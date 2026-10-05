import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeScript } from "@/components/site/theme-script"
import { SITE_URL } from "@/lib/registry"

import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Ballmac UI: Make your web app feel native", template: "%s | Ballmac UI" },
  description:
    "Crafted React and Tailwind components with native-app motion, accessibility built in and code you own. Install with one command or your AI agent.",
  openGraph: { siteName: "Ballmac UI", type: "website" },
  twitter: { card: "summary_large_image", site: "@ballmacapps" },
  // Proves to Bing Webmaster Tools that we own the site. Keep it: removing it un-verifies the site.
  verification: { other: { "msvalidate.01": "F5C35C8FE8CCD8D2C21A4EAD3443CDD0" } },
}

// The browser bar colour on phones follows the colour scheme.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        {children}
      </body>
    </html>
  )
}
