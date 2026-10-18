import { ArrowRight, Hash } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Callout, Note, Tip, Warning } from "@/components/docs/callout"
import { CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from "@/components/docs/code-tabs"
import { Pre } from "@/components/docs/pre"
import Link from "@/components/site/link"

function heading(Tag: "h2" | "h3" | "h4") {
  return function Heading({ id, children, ...props }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...props} className="group/heading">
        {id ? (
          <a href={`#${id}`} className="!text-inherit !no-underline">
            {children}
            <Hash aria-hidden="true" className="text-muted-foreground ms-2 inline size-3.5 opacity-0 transition-opacity group-hover/heading:opacity-100 group-focus-within/heading:opacity-100" />
          </a>
        ) : (
          children
        )}
      </Tag>
    )
  }
}

function A({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} {...props}>{children}</Link>
  return (
    <a href={href} {...props} {...(href.startsWith("http") ? { rel: "noreferrer" } : {})}>
      {children}
    </a>
  )
}

function Table(props: ComponentProps<"table">) {
  return (
    <div role="region" tabIndex={0} aria-label="Table" className="focus-visible:ring-ring/50 not-prose my-5 overflow-x-auto rounded-xl border outline-none focus-visible:ring-[3px]">
      <table {...props} className="w-full min-w-[480px] text-start text-sm [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_th]:bg-card [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-start [&_th]:font-medium [&_tr+tr]:border-t [&_td]:text-muted-foreground [&_td_code]:text-foreground [&_td_code]:font-mono [&_td_code]:text-[0.85em]" />
    </div>
  )
}

/** Numbers the h3 headings inside it, for a procedure. */
function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="ms-3 space-y-5 border-s ps-8 [counter-reset:step] [&_h3]:relative [&_h3]:mt-10 [&_h3]:[counter-increment:step] [&_h3]:before:absolute [&_h3]:before:-start-[3.25rem] [&_h3]:before:flex [&_h3]:before:size-7 [&_h3]:before:items-center [&_h3]:before:justify-center [&_h3]:before:rounded-full [&_h3]:before:border [&_h3]:before:bg-background [&_h3]:before:text-xs [&_h3]:before:font-medium [&_h3]:before:content-[counter(step)] [&_h3:first-child]:mt-0">
      {children}
    </div>
  )
}

function Cards({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">{children}</div>
}

function Card({ href, title, children }: { href: string; title: string; children?: ReactNode }) {
  return (
    <Link href={href} className="bg-card hover:bg-accent focus-visible:ring-ring/50 group flex items-start justify-between gap-4 rounded-xl border p-4 !no-underline outline-none transition-colors focus-visible:ring-[3px]">
      <span>
        <span className="text-foreground block font-medium">{title}</span>
        {children && <span className="text-muted-foreground mt-1 block text-sm leading-snug">{children}</span>}
      </span>
      <ArrowRight className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
    </Link>
  )
}

/** What every docs page can use without an import. */
export function mdxComponents() {
  return {
    h2: heading("h2"),
    h3: heading("h3"),
    h4: heading("h4"),
    a: A,
    pre: Pre,
    table: Table,
    Callout,
    Note,
    Tip,
    Warning,
    Steps,
    Cards,
    Card,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    CodeBlockTab,
  }
}
