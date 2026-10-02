// Ballmac UI: Error 1. https://ui.ballmac.com/blocks/error-1
"use client"

import * as React from "react"
import { ArrowLeft, ArrowUpRight, BookOpen, Home, LifeBuoy, Tag } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Button, buttonVariants } from "@/components/ballmac/button"
import { SearchField } from "@/components/ballmac/search-field"
import { cn } from "@/lib/utils"

type Error1Status = "404" | "403" | "500"

type Error1Link = { label: string; description?: string; href: string; icon?: React.ReactNode }

type Error1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Which error this is. Sets the numerals and the default words. */
  status?: Error1Status
  /** Overrides the default headline. */
  title?: string
  /** Overrides the default explanation. */
  description?: string
  /** Helpful places to go next. Pass an empty array to hide them. */
  links?: Error1Link[]
  /** Show a search field. Pass false to hide it. */
  search?: boolean
  /** Called with the query when the visitor searches. */
  onSearch?: (query: string) => void
  /** Where the primary button goes. */
  homeHref?: string
  /** Small reference line under the buttons, e.g. a request id to quote to support. */
  reference?: string
}

const copy: Record<Error1Status, { title: string; description: string }> = {
  "404": { title: "This page took a wrong turn.", description: "The page you are looking for has moved, been renamed or never existed. Try a search, or head to one of these." },
  "403": { title: "You don’t have access to this.", description: "Your account doesn’t have permission to view this page. If you think that is a mistake, ask the owner to invite you." },
  "500": { title: "Something broke on our side.", description: "We hit an unexpected error and have been notified. Try again in a moment; if it keeps happening, tell us what you were doing." },
}

const defaultLinks: Error1Link[] = [
  { label: "Home", description: "Back to the start", href: "#", icon: <Home /> },
  { label: "Documentation", description: "Guides and API reference", href: "#", icon: <BookOpen /> },
  { label: "Pricing", description: "Plans for every team", href: "#", icon: <Tag /> },
  { label: "Contact support", description: "A real person replies", href: "#", icon: <LifeBuoy /> },
]

/** A zero drawn as a ring with a small moon in orbit. */
function Ring() {
  const reduce = useReducedMotion()
  return (
    <span aria-hidden="true" className="relative inline-block size-[0.72em] align-[-0.02em]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="13" className="stroke-current" />
      </svg>
      <motion.span
        className="absolute inset-0"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <span className="bg-chart-1 absolute top-[-5%] left-1/2 size-[18%] -translate-x-1/2 rounded-full shadow-[0_0_0_0.04em_var(--background)]" />
      </motion.span>
    </span>
  )
}

function Error1({
  status = "404",
  title,
  description,
  links = defaultLinks,
  search = true,
  onSearch,
  homeHref = "#",
  reference,
  className,
  ...props
}: Error1Props) {
  const [query, setQuery] = React.useState("")
  const words = copy[status]
  return (
    <section data-slot="error-1" className={cn("relative isolate mx-auto flex max-w-4xl overflow-x-clip flex-col items-center px-4 py-16 text-center sm:px-6 md:py-24", className)} {...props}>
      <div aria-hidden="true" className="bg-chart-1/10 pointer-events-none absolute top-0 left-1/2 -z-10 size-[28rem] -translate-x-1/2 rounded-full blur-[110px]" />

      <p
        aria-hidden="true"
        className="text-foreground [mask-image:linear-gradient(to_bottom,black_45%,transparent_98%)] text-[clamp(7rem,26vw,16rem)] leading-[0.9] font-semibold tracking-[-0.06em] tabular-nums select-none"
      >
        {status.split("").map((ch, i) => (ch === "0" ? <Ring key={i} /> : <span key={i}>{ch}</span>))}
      </p>

      <h1 className="-mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
        <span className="sr-only">Error {status}: </span>
        {title ?? words.title}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-lg text-lg text-pretty">{description ?? words.description}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a className={buttonVariants({ size: "lg", shape: "pill" })} href={homeHref}>
          <Home /> Take me home
        </a>
        <Button variant="outline" size="lg" shape="pill" onClick={() => window.history.back()}>
          <ArrowLeft  className="rtl:rotate-180"/> Go back
        </Button>
      </div>
      {reference && <p className="text-muted-foreground mt-6 font-mono text-xs">Reference: {reference}</p>}

      {search && (
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) onSearch?.(query.trim())
          }}
          className="mt-12 w-full max-w-md"
        >
          <SearchField label="Search the site" placeholder="Search the site" value={query} onValueChange={setQuery} onSearch={(v) => v.trim() && onSearch?.(v.trim())} />
        </form>
      )}

      {links.length > 0 && (
        <ul className="mt-8 grid w-full gap-3 text-start sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="group/link hover:bg-accent focus-visible:ring-ring/50 flex h-full items-center gap-4 rounded-2xl border p-4 outline-none transition-colors focus-visible:ring-[3px]">
                <span aria-hidden="true" className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5">{l.icon ?? <ArrowUpRight  className="rtl:-scale-x-100"/>}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{l.label}</span>
                  {l.description && <span className="text-muted-foreground block text-sm">{l.description}</span>}
                </span>
                <ArrowUpRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/link:-translate-x-0.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { Error1, type Error1Props, type Error1Link, type Error1Status }
