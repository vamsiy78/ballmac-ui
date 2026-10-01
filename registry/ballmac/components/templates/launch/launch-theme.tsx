// Ballmac UI: Launch template shell. https://ui.ballmac.com/templates/template-launch
"use client"

import * as React from "react"
import { Globe, Mail } from "lucide-react"

import { Footer2 } from "@/components/ballmac/blocks/footer-2/footer-2"
import { Header2 } from "@/components/ballmac/blocks/header-2/header-2"
import { launchMono, launchSans } from "@/components/ballmac/templates/launch/launch-fonts"
import { cn } from "@/lib/utils"

type LaunchPage = "home" | "pricing" | "changelog" | "contact"
type LaunchHrefs = Record<LaunchPage, string>

const defaultHrefs: LaunchHrefs = { home: "/launch", pricing: "/launch/pricing", changelog: "/launch/changelog", contact: "/launch/contact" }

/** Beacon's palette: warm paper, graphite ink and one electric violet. Dark mode is graphite with the violet turned up. */
const launchCss = `
.launch-theme,body:has(.launch-theme){--background:oklch(0.985 0.006 85);--foreground:oklch(0.2 0.02 285);--card:oklch(1 0 0);--card-foreground:oklch(0.2 0.02 285);--popover:oklch(1 0 0);--popover-foreground:oklch(0.2 0.02 285);--primary:oklch(0.5 0.24 285);--primary-foreground:oklch(0.99 0.005 285);--secondary:oklch(0.95 0.012 85);--secondary-foreground:oklch(0.2 0.02 285);--muted:oklch(0.955 0.01 85);--muted-foreground:oklch(0.46 0.03 285);--accent:oklch(0.94 0.025 290);--accent-foreground:oklch(0.2 0.02 285);--border:oklch(0.2 0.02 285 / 12%);--input:oklch(0.2 0.02 285 / 20%);--ring:oklch(0.55 0.22 285);--surface:oklch(0.968 0.01 85);--destructive:oklch(0.52 0.21 27);--chart-1:oklch(0.5 0.24 285);--chart-2:oklch(0.7 0.17 160);--chart-3:oklch(0.75 0.16 70);--chart-4:oklch(0.65 0.2 25);--chart-5:oklch(0.62 0.17 230);--radius:0.9rem}
.dark .launch-theme,.dark body:has(.launch-theme){--background:oklch(0.15 0.015 285);--foreground:oklch(0.96 0.008 85);--card:oklch(0.19 0.018 285);--card-foreground:oklch(0.96 0.008 85);--popover:oklch(0.21 0.02 285);--popover-foreground:oklch(0.96 0.008 85);--primary:oklch(0.72 0.19 285);--primary-foreground:oklch(0.15 0.03 285);--secondary:oklch(0.24 0.02 285);--secondary-foreground:oklch(0.96 0.008 85);--muted:oklch(0.23 0.02 285);--muted-foreground:oklch(0.74 0.03 285);--accent:oklch(0.28 0.04 285);--accent-foreground:oklch(0.96 0.008 85);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 15%);--ring:oklch(0.72 0.19 285);--surface:oklch(0.175 0.017 285);--destructive:oklch(0.7 0.19 27);--chart-1:oklch(0.72 0.19 285);--chart-2:oklch(0.78 0.16 160);--chart-3:oklch(0.82 0.14 75);--chart-4:oklch(0.74 0.17 25);--chart-5:oklch(0.76 0.13 230)}
body:has(.launch-theme){font-family:var(--launch-sans),ui-sans-serif,system-ui,sans-serif}
`

type LaunchShellProps = React.ComponentProps<"div"> & {
  /** The page being shown. */
  page: LaunchPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<LaunchHrefs>
}

/**
 * Beacon's frame: Header2 and Footer2 with Beacon's links, in Beacon's palette and type.
 * Every page of the template is this shell around Ballmac blocks, so any block can be swapped for another.
 */
function LaunchShell({ page: _page, hrefs: overrides, className, style, children, ...props }: LaunchShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  React.useEffect(() => {
    const classes = [launchSans.variable, launchMono.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  return (
    <div
      data-slot="launch"
      className={cn("launch-theme bg-background text-foreground min-h-dvh overflow-x-clip", launchSans.variable, launchMono.variable, className)}
      style={{ fontFamily: "var(--launch-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{launchCss}</style>
      <Header2
        brand="Beacon"
        brandHref={hrefs.home}
        items={[{ label: "Product", href: hrefs.home }, { label: "Pricing", href: hrefs.pricing }, { label: "Changelog", href: hrefs.changelog }, { label: "Contact", href: hrefs.contact }]}
        secondaryAction={{ label: "Sign in", href: hrefs.contact }}
        primaryAction={{ label: "Start free", href: hrefs.pricing }}
      />
      {children}
      <Footer2
        brand="Beacon"
        tagline="Preview every branch, watch every budget and roll back in one click."
        columns={[
          { title: "Product", links: [{ label: "Overview", href: hrefs.home }, { label: "Pricing", href: hrefs.pricing }, { label: "Changelog", href: hrefs.changelog }] },
          { title: "Company", links: [{ label: "About", href: hrefs.home }, { label: "Careers", href: hrefs.contact }, { label: "Contact", href: hrefs.contact }] },
          { title: "Resources", links: [{ label: "Documentation", href: hrefs.home }, { label: "Status", href: hrefs.home }, { label: "Security", href: hrefs.home }] },
        ]}
        socials={[{ label: "Beacon website", href: hrefs.home, icon: <Globe /> }, { label: "Email Beacon", href: hrefs.contact, icon: <Mail /> }]}
        legal="© 2026 Beacon Labs, Inc."
        legalLinks={[{ label: "Privacy", href: hrefs.home }, { label: "Terms", href: hrefs.home }]}
      />
    </div>
  )
}

export { LaunchShell, defaultHrefs as launchDefaultHrefs, launchMono, type LaunchHrefs, type LaunchPage, type LaunchShellProps }
