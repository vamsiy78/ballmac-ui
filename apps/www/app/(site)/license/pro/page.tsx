import { Ban, Check, FileText } from "lucide-react"
import type { Metadata } from "next"
import * as React from "react"

import Link from "@/components/site/link"
import { PRO_LICENCE_EFFECTIVE, PRO_LICENCE_EMAIL, PRO_LICENCE_PATH, PRO_LICENCE_VERSION, proLicence, proLicenceSummary, sectionNumber, type Block } from "@/lib/pro-licence"

export const metadata: Metadata = {
  title: "Ballmac UI Pro Licence Agreement",
  description: "The terms for Ballmac UI Pro: what you can build with it, what you cannot do, how seats and updates work, and how disputes are settled.",
  alternates: { canonical: PRO_LICENCE_PATH },
}

/** Turns `**bold**` into <strong> and `[[id]]` into a link to that section. */
function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\[[a-z-]+\]\])/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith("[[")) {
      const id = part.slice(2, -2)
      return (
        <a key={i} href={`#${id}`}>
          section {sectionNumber(id)}
        </a>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        "p" in b ? (
          <p key={i}>{inline(b.p)}</p>
        ) : "ol" in b ? (
          <ol key={i} className="list-decimal space-y-3 ps-6 marker:text-muted-foreground">
            {b.ol.map((t, n) => (
              <li key={n}>{inline(t)}</li>
            ))}
          </ol>
        ) : (
          <ul key={i} className="list-disc space-y-3 ps-6 marker:text-muted-foreground">
            {b.ul.map((t, n) => (
              <li key={n}>{inline(t)}</li>
            ))}
          </ul>
        )
      )}
    </>
  )
}

export default function ProLicencePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-muted-foreground text-sm font-medium">
        <Link href="/license" className="hover:text-foreground underline-offset-4 hover:underline">
          License
        </Link>{" "}
        / Pro
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Ballmac UI Pro Licence Agreement</h1>
      <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span>Version {PRO_LICENCE_VERSION}</span>
        <span aria-hidden="true">·</span>
        <span>Effective {PRO_LICENCE_EFFECTIVE}</span>
        <span aria-hidden="true">·</span>
        <Link href={`${PRO_LICENCE_PATH}/text`} className="text-foreground inline-flex items-center gap-1.5 underline underline-offset-4">
          <FileText className="size-3.5" aria-hidden="true" />
          Plain-text copy
        </Link>
      </p>

      <aside aria-labelledby="summary-h" className="bg-card mt-10 rounded-2xl border p-6 sm:p-8">
        <h2 id="summary-h" className="text-lg font-semibold tracking-tight">
          In plain English
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">This summary helps you read the terms. It is not part of the agreement.</p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Check className="size-4" aria-hidden="true" /> You can
            </p>
            <ul className="text-muted-foreground mt-3 space-y-2.5 text-sm leading-relaxed">
              {proLicenceSummary.can.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Ban className="size-4" aria-hidden="true" /> You cannot
            </p>
            <ul className="text-muted-foreground mt-3 space-y-2.5 text-sm leading-relaxed">
              {proLicenceSummary.cannot.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="text-muted-foreground mt-6 space-y-2.5 border-t pt-6 text-sm leading-relaxed">
          {proLicenceSummary.notes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </aside>

      <nav aria-label="Sections" className="mt-12">
        <p className="text-sm font-semibold">Contents</p>
        <ol className="text-muted-foreground mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
          {proLicence.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="hover:text-foreground underline-offset-4 hover:underline">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="text-muted-foreground mt-14 space-y-12 leading-relaxed [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
        {proLicence.map((s, i) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24 space-y-4">
            <h2 id={`${s.id}-h`} className="text-foreground text-xl font-semibold tracking-tight">
              {i + 1}. {s.title}
            </h2>
            <Blocks blocks={s.blocks} />
          </section>
        ))}
      </div>

      <p className="text-muted-foreground mt-16 border-t pt-8 text-sm leading-relaxed">
        Questions about this agreement? Write to <a href={`mailto:${PRO_LICENCE_EMAIL}`} className="text-foreground underline underline-offset-4">{PRO_LICENCE_EMAIL}</a> before you buy and you will get an answer from a person.
        The licence for free components, blocks and templates is on the <Link href="/license" className="text-foreground underline underline-offset-4">License page</Link>.
      </p>
    </div>
  )
}
