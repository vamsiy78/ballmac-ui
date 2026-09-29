import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeScript } from "@/components/site/theme-script"
import { SITE_URL } from "@/lib/registry"

import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Ballmac UI: Mac-grade React components for the web", template: "%s | Ballmac UI" },
  description:
    "Mac-grade React and Tailwind components: docks, windows, globes, beams, text effects and AI interfaces. Free, accessible and shadcn-compatible.",
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
        {children}
      </body>
    </html>
  )
}
