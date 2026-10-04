import type { Metadata } from "next"
import Link from "@/components/site/link"

import { getAllItems, itemHref } from "@/lib/registry"

export const metadata: Metadata = {
  title: "License",
  description: "License terms for Ballmac UI free components, blocks and templates, and notices for the open-source work they build on.",
  alternates: { canonical: "/license" },
}

const MIT = `MIT License

Copyright (c) 2026 Ballmac

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`

/** Legal page: the license for free items and notices for adapted open-source code. */
export default function LicensePage() {
  // One entry per upstream project (e.g. shadcn/ui), listing every item that builds on it.
  const sources = new Map<string, { url: string; license: string; copyright: string; items: { name: string; title: string; href: string }[] }>()
  for (const item of getAllItems()) {
    if (!item.source) continue
    const project = item.source.name.replace(new RegExp(`\\s*${item.title}$`), "") || item.source.name
    const repo = item.source.url.match(/^https:\/\/github\.com\/[^/]+\/[^/]+/)?.[0] ?? item.source.url
    const entry = sources.get(project) ?? { url: repo, license: item.source.license, copyright: item.source.copyright, items: [] }
    entry.items.push({ name: item.name, title: item.title, href: itemHref(item) })
    sources.set(project, entry)
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">License</h1>
      <p className="text-muted-foreground mt-3 text-base leading-relaxed">Last updated September 29, 2026</p>

      <div className="text-muted-foreground mt-10 space-y-10 leading-relaxed [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
        <section className="space-y-4">
          <h2>Free components, blocks and templates</h2>
          <p>
            Every free item in Ballmac UI is released under the MIT License below. You can use, change and ship them in personal,
            client and commercial projects. If you redistribute the source itself, keep the notice in the files.
          </p>
          <pre className="bg-muted/50 overflow-x-auto rounded-xl border p-5 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">{MIT}</pre>
        </section>

        <section className="space-y-4">
          <h2>Pro</h2>
          <p>
            Ballmac UI Pro items will be covered by a separate commercial license, published before Pro goes on sale. See{" "}
            <Link href="/pricing">pricing</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2>Third-party notices</h2>
          <p>
            Some items adapt code from other open-source projects. Those files keep the original copyright notice in their
            header, and the projects are listed here.
          </p>
          <ul className="divide-y rounded-xl border">
            {[...sources.entries()].map(([name, s]) => (
              <li key={name} className="space-y-1.5 p-5">
                <p className="text-foreground font-medium">
                  <a href={s.url}>{name}</a>
                </p>
                <p className="text-sm">
                  {s.copyright}. Licensed under the {s.license} License.
                </p>
                <p className="text-sm">
                  Used in:{" "}
                  {s.items.map((i, n) => (
                    <span key={i.name}>
                      {n > 0 && ", "}
                      <Link href={i.href}>{i.title}</Link>
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
          <p>
            Ballmac UI only builds on code under permissive licenses and never copies from paid or restricted libraries.
          </p>
        </section>

        <section className="space-y-4">
          <h2>Questions</h2>
          <p>
            Reach us through <a href="https://ballmac.com/support">ballmac.com/support</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
