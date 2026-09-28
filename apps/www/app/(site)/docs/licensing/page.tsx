import type { Metadata } from "next"
import Link from "next/link"

import { DocsPage } from "@/components/site/docs-page"

export const metadata: Metadata = {
  title: "Licensing",
  description: "Ballmac UI free components are MIT licensed. Credits for adapted open-source code are kept in each file and on each component page.",
  alternates: { canonical: "/docs/licensing" },
}

export default function LicensingPage() {
  return (
    <DocsPage title="Licensing" lead="Free components are MIT licensed: use them in personal and commercial projects, and change them however you like.">
      <h2>Free components</h2>
      <p>
        Everything marked <strong>Free · MIT</strong> is released under the MIT License, © 2026 Ballmac. Keep the license
        notice in the files if you redistribute the source itself.
      </p>
      <h2>Credits</h2>
      <p>
        Some components adapt code from other MIT-licensed projects, such as shadcn/ui. Those files keep the original
        notice in their header, the component page names the source, and the repository lists them in{" "}
        <code>THIRD_PARTY_NOTICES.md</code>. Ballmac UI only reuses code under permissive licenses (MIT, ISC, BSD,
        Apache-2.0) and never copies from paid or restricted libraries.
      </p>
      <h2>Pro</h2>
      <p>
        Ballmac UI Pro will add premium blocks and templates under a commercial license. See{" "}
        <Link href="/pricing">pricing</Link>.
      </p>
    </DocsPage>
  )
}
