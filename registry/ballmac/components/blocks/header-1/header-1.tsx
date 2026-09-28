// Ballmac UI: Header 1. https://ui.ballmac.com/blocks/header-1
"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"

import { Button, buttonVariants } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type NavLink = { label: string; href: string }

type Header1Props = React.ComponentProps<"header"> & {
  /** Brand name or logo. */
  brand?: React.ReactNode
  /** Where the brand links to. */
  brandHref?: string
  /** Main navigation links. */
  links?: NavLink[]
  /** Quiet action on the right, e.g. sign in. */
  secondaryAction?: NavLink
  /** Main action on the right. */
  primaryAction?: NavLink
  /** Stick to the top with a blurred background. */
  sticky?: boolean
}

function Header1({
  brand = "Acme",
  brandHref = "#",
  links = [
    { label: "Product", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Customers", href: "#" },
    { label: "Docs", href: "#" },
  ],
  secondaryAction = { label: "Sign in", href: "#" },
  primaryAction = { label: "Get started", href: "#" },
  sticky = true,
  className,
  ...props
}: Header1Props) {
  const [open, setOpen] = React.useState(false)
  const menuId = React.useId()
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])
  return (
    <header data-slot="header-1" className={cn("z-40 w-full border-b bg-background/80 backdrop-blur-xl", sticky && "sticky top-0", className)} {...props}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <a href={brandHref} className="rounded-md text-lg font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          {brand}
        </a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <a className={buttonVariants({ variant: "ghost" })} href={secondaryAction.href}>{secondaryAction.label}</a>
          <a className={buttonVariants({ shape: "pill" })} href={primaryAction.href}>{primaryAction.label}</a>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      <nav id={menuId} aria-label="Mobile" hidden={!open} className="border-t px-4 pt-2 pb-4 md:hidden">
        <ul className="flex flex-col">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2.5 text-base font-medium hover:bg-accent">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-2">
          <a className={buttonVariants({ variant: "outline" })} href={secondaryAction.href}>{secondaryAction.label}</a>
          <a className={buttonVariants()} href={primaryAction.href}>{primaryAction.label}</a>
        </div>
      </nav>
    </header>
  )
}

export { Header1, type Header1Props }
