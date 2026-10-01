// Ballmac UI: Ledger changelog page. https://ui.ballmac.com/templates/template-ledger
import * as React from "react"

import { Changelog1 } from "@/components/ballmac/blocks/changelog-1/changelog-1"
import { LedgerHeading, LedgerShell, type LedgerHrefs } from "@/components/ballmac/templates/ledger/ledger-theme"

type LedgerChangelogProps = React.ComponentProps<"div"> & { hrefs?: Partial<LedgerHrefs> }

/** Ledger changelog: release notes with a generated cover on headline releases. */
function LedgerChangelog({ hrefs, ...props }: LedgerChangelogProps) {
  return (
    <LedgerShell page="changelog" hrefs={hrefs} {...props}>
      <main>
        <div className="px-4 pt-16 text-center sm:px-6 sm:pt-20">
          <LedgerHeading as="h1" className="text-4xl sm:text-6xl">What’s <em>new</em>.</LedgerHeading>
        </div>
        <Changelog1 title="Every release, in plain language." description="We ship every few weeks. Here is what changed and why." />
      </main>
    </LedgerShell>
  )
}

export { LedgerChangelog, type LedgerChangelogProps }
