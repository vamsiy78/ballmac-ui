import type { ReactNode } from "react"

import { Eyebrow } from "@/components/site/section-heading"

/** Consistent docs article: eyebrow, title, lead, then prose-styled content. */
export function DocsPage({ eyebrow = "Docs", title, lead, children }: { eyebrow?: string; title: string; lead: ReactNode; children: ReactNode }) {
  return (
    <article className="min-w-0 max-w-3xl">
      <header className="space-y-3 pb-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        <p className="text-muted-foreground max-w-2xl text-[1.05rem] leading-7 text-balance sm:text-base">{lead}</p>
      </header>
      <div
        className={[
          "space-y-5 pt-8 leading-relaxed",
          "[&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
          "[&_h3]:mt-8 [&_h3]:font-semibold",
          "[&_p]:text-muted-foreground [&_li]:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
          "[&_strong]:text-foreground [&_strong]:font-medium",
          "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
          "[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:rounded [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] [&_:not(pre)>code]:text-foreground",
        ].join(" ")}
      >
        {children}
      </div>
    </article>
  )
}
