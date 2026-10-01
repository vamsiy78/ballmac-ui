// Ballmac UI: Header 2. https://ui.ballmac.com/blocks/header-2
"use client"

import * as React from "react"
import { BarChart3, Blocks, BookOpen, Code2, Layers, LifeBuoy, Menu, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { MegaMenu, MegaMenuMobileList, type MegaMenuItem } from "@/components/ballmac/mega-menu"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ballmac/sheet"
import { cn } from "@/lib/utils"

type Action = { label: string; href: string }

type Header2Props = React.ComponentProps<"header"> & {
  /** Brand name beside the logo mark. */
  brand?: string
  /** Where the brand links to. */
  brandHref?: string
  /** Logo mark. Defaults to a simple rounded square with the brand's first letter. */
  logo?: React.ReactNode
  /** Navigation: links, or panels with grouped links and an optional featured card. */
  items?: MegaMenuItem[]
  /** Quiet action on the right, e.g. sign in. */
  secondaryAction?: Action
  /** Main action on the right. */
  primaryAction?: Action
  /** Stick to the top of the page with a blurred background. */
  sticky?: boolean
}

const defaultItems: MegaMenuItem[] = [
  {
    label: "Product",
    columns: [
      {
        title: "Build",
        links: [
          { title: "Workspaces", href: "#", description: "Projects, files and approvals in one place.", icon: <Layers /> },
          { title: "Automations", href: "#", description: "Run tasks when things change.", icon: <Workflow />, badge: "New" },
          { title: "API", href: "#", description: "Build on the same data.", icon: <Code2 /> },
        ],
      },
      {
        title: "Run",
        links: [
          { title: "Analytics", href: "#", description: "Usage and performance at a glance.", icon: <BarChart3 /> },
          { title: "Security", href: "#", description: "Roles, audit logs and sign-in policies.", icon: <ShieldCheck /> },
          { title: "Integrations", href: "#", description: "Connect the tools you already use.", icon: <Blocks /> },
        ],
      },
    ],
    featured: { title: "What’s new", description: "See the latest releases and what they change for your team.", href: "#", media: <Sparkles />, cta: "Read the changelog" },
  },
  {
    label: "Solutions",
    columns: [
      {
        links: [
          { title: "Startups", href: "#", description: "Move fast with a small team.", icon: <Users /> },
          { title: "Enterprise", href: "#", description: "Controls for larger organizations.", icon: <ShieldCheck /> },
        ],
      },
    ],
  },
  {
    label: "Resources",
    columns: [
      {
        links: [
          { title: "Documentation", href: "#", description: "Guides and API reference.", icon: <BookOpen /> },
          { title: "Help center", href: "#", description: "Answers from our support team.", icon: <LifeBuoy /> },
        ],
      },
    ],
  },
  { label: "Pricing", href: "#" },
]

function Header2({
  brand = "Acme",
  brandHref = "#",
  logo,
  items = defaultItems,
  secondaryAction = { label: "Sign in", href: "#" },
  primaryAction = { label: "Get started", href: "#" },
  sticky = true,
  className,
  ...props
}: Header2Props) {
  const [open, setOpen] = React.useState(false)
  return (
    <header data-slot="header-2" className={cn("bg-background/80 z-40 w-full border-b backdrop-blur-xl", sticky && "sticky top-0", className)} {...props}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <a href={brandHref} className="focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight outline-none focus-visible:ring-[3px]">
          {logo ?? (
            <span aria-hidden="true" className="bg-foreground text-background flex size-7 items-center justify-center rounded-lg text-sm font-bold">
              {brand[0]}
            </span>
          )}
          {brand}
        </a>
        <MegaMenu items={items} label="Main" viewportAlign="start" />
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <a className={buttonVariants({ variant: "ghost" })} href={secondaryAction.href}>{secondaryAction.label}</a>
          <a className={buttonVariants({ shape: "pill" })} href={primaryAction.href}>{primaryAction.label}</a>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "ml-auto md:hidden" })} aria-label="Open menu">
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" closeLabel="Close menu" className="w-[min(22rem,90vw)]">
            <SheetHeader>
              <SheetTitle>{brand}</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <MegaMenuMobileList items={items} onNavigate={() => setOpen(false)} />
            </SheetBody>
            <SheetFooter className="grid gap-2">
              <a className={buttonVariants({ shape: "pill", size: "lg" })} href={primaryAction.href}>{primaryAction.label}</a>
              <a className={buttonVariants({ variant: "outline", shape: "pill", size: "lg" })} href={secondaryAction.href}>{secondaryAction.label}</a>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export { Header2, type Header2Props }
