import { ArrowLeft, ArrowRight, ChevronRight, Pencil } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CopyMarkdownButton } from "@/components/docs/copy-markdown"
import { mdxComponents } from "@/components/docs/mdx"
import { docsProse } from "@/components/docs/prose"
import { DocsToc, type TocItem } from "@/components/docs/toc"
import Link from "@/components/site/link"
import { dateLabel } from "@/lib/changelog"
import { allDocs, editUrl, lastUpdated, mdHref, neighbours, sectionOf } from "@/lib/docs"
import { source } from "@/lib/docs-source"
import { cn } from "@/lib/utils"

export const dynamicParams = false

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const page = source.getPage((await params).slug)
  if (!page) return {}
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url, types: { "text/markdown": mdHref(page) } },
  }
}

const textOf = (node: unknown): string => {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (typeof node === "object" && "props" in (node as object)) return textOf(((node as { props: { children?: unknown } }).props).children)
  return ""
}

export default async function DocsContentPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const MDX = page.data.body
  const toc: TocItem[] = page.data.toc.map((t) => ({ id: t.url.slice(1), label: textOf(t.title), depth: t.depth })).filter((t) => t.depth <= 3)
  const { prev, next } = neighbours(page)
  const section = sectionOf(page)
  const updated = lastUpdated(page)
  const generated = Boolean(page.data.generatedFrom)
  void allDocs
  return (
    <div className="grid gap-x-12 xl:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="min-w-0 max-w-3xl">
        <header className="space-y-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Link href="/docs" className="hover:text-foreground">
                Docs
              </Link>
              {section && (
                <>
                  <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                  <span>{section.title}</span>
                </>
              )}
            </nav>
            <div className="flex items-center gap-2">
              <CopyMarkdownButton href={mdHref(page)} />
              <a
                href={mdHref(page)}
                className="bg-background hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px]"
              >
                View as Markdown
              </a>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{page.data.title}</h1>
          {page.data.description && <p className="text-muted-foreground max-w-2xl text-[1.05rem] leading-7 text-pretty sm:text-base">{page.data.description}</p>}
        </header>
        {toc.length > 1 && (
          <details className="bg-card mt-6 rounded-xl border xl:hidden">
            <summary className="focus-visible:ring-ring/50 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus-visible:ring-[3px]">On this page</summary>
            <div className="px-4 pb-3">
              <DocsToc items={toc} />
            </div>
          </details>
        )}
        {generated && (
          <p className="text-muted-foreground bg-card mt-6 rounded-xl border px-4 py-2.5 text-[13px]">
            This page is generated from <code className="font-mono text-[0.9em]">{page.data.generatedFrom}</code>. To change it, change the source and run <code className="font-mono text-[0.9em]">pnpm docs:generate</code>.
          </p>
        )}
        <div className={cn("pt-6 [&>:first-child]:mt-0", docsProse)}>
          <MDX components={mdxComponents()} />
        </div>
        <footer className="mt-16 space-y-8 border-t pt-6">
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[13px]">
            <a href={editUrl(page)} className="hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded outline-none focus-visible:ring-[3px]">
              <Pencil className="size-3.5" aria-hidden="true" />
              {generated ? "View the source on GitHub" : "Edit this page on GitHub"}
            </a>
            {updated && (
              <span>
                Last updated <time dateTime={updated}>{dateLabel(updated)}</time>
              </span>
            )}
          </div>
          <nav aria-label="Previous and next" className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={prev.url} className="hover:bg-accent focus-visible:ring-ring/50 rounded-xl border p-4 outline-none transition-colors focus-visible:ring-[3px]">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <ArrowLeft className="size-3 rtl:rotate-180" aria-hidden="true" /> Previous
                </span>
                <span className="mt-1 block text-sm font-medium">{prev.data.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={next.url} className="hover:bg-accent focus-visible:ring-ring/50 rounded-xl border p-4 text-end outline-none transition-colors focus-visible:ring-[3px] sm:col-start-2">
                <span className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs">
                  Next <ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-sm font-medium">{next.data.title}</span>
              </Link>
            )}
          </nav>
        </footer>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto py-1">
          <DocsToc items={toc} />
        </div>
      </aside>
    </div>
  )
}
