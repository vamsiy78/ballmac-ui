import type { Metadata } from "next"
import Link from "next/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import { PRO_REGISTRY_SNIPPET } from "@/components/site/item-install"
import { SITE_URL } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Ballmac UI Pro",
  description: "Set up Ballmac UI Pro: add your licence key and the private registry, then install Pro blocks, templates and starters with the shadcn CLI or the MCP server.",
  alternates: { canonical: "/docs/pro" },
}

export default function ProDocsPage() {
  return (
    <DocsPage
      title="Ballmac UI Pro"
      lead="Pro items install the same way as free ones, from a private registry that checks your licence key. Set it up once per project."
    >
      <h2>1. Get a licence key</h2>
      <p>
        Buy Pro on the <Link href="/pricing">pricing page</Link>. Your licence key arrives by email and is also in your
        receipt. Keep it private: anyone with the key can install Pro items.
      </p>
      <h2>2. Add the key to your project</h2>
      <p>
        Put it in <code>.env.local</code>, which the shadcn CLI reads. Do not commit this file.
      </p>
      <CodePanel lang="bash" title=".env.local" code="BALLMAC_LICENSE_KEY=your-licence-key" />
      <h2>3. Add the Pro registry</h2>
      <p>
        Add both registries to <code>components.json</code>. The CLI sends your key only to the Pro registry.
      </p>
      <CodePanel lang="json" title="components.json" code={PRO_REGISTRY_SNIPPET} />
      <h2>4. Install Pro items</h2>
      <p>Pro items use the <code>@ballmac-pro</code> namespace. Their page shows the exact command.</p>
      <CodePanel lang="bash" code="npx shadcn@latest add @ballmac-pro/<name>" />
      <p>Free items keep working as before, and a Pro item can depend on free ones.</p>
      <h2>Starter apps</h2>
      <p>
        A starter is a complete app you download and own. <strong>Beacon SaaS</strong> is a Next.js app with sign-in, workspaces with
        teams and invitations, Stripe billing, a dashboard, settings and API keys. Download it with the same key:
      </p>
      <CodePanel lang="bash" code={`mkdir my-app && curl -fsSL -H "Authorization: Bearer $BALLMAC_LICENSE_KEY" ${SITE_URL}/r/pro/starters/beacon-saas.tar.gz | tar -xz -C my-app --strip-components=1 && cd my-app && pnpm install && pnpm dev`} />
      <p>
        It runs on an embedded database in development, so there is nothing else to install. The README in the download covers
        customising it, billing and deployment.
      </p>
      <h2>With the MCP server</h2>
      <p>
        Give the Ballmac MCP server your key and it can read Pro items and give your agent the right install commands.
      </p>
      <CodePanel lang="bash" title="Claude Code" code="claude mcp add ballmac --env BALLMAC_LICENSE_KEY=your-licence-key -- npx -y @ballmac/mcp" />
      <h2>Teams and CI</h2>
      <p>
        Set <code>BALLMAC_LICENSE_KEY</code> as a secret in your CI or hosting provider. Each person on a Team licence
        can use the shared key in their own <code>.env.local</code>.
      </p>
      <h2>Check a key</h2>
      <CodePanel lang="bash" code={`curl -s -X POST ${SITE_URL}/api/v1/license/verify -H "content-type: application/json" -d '{"key":"your-licence-key"}'`} />
      <p>
        The answer is <code>{'{"valid":true}'}</code> or a reason the key is not accepted.
      </p>
      {process.env.NEXT_PUBLIC_PRO_LICENSE_URL && (
        <>
          <h2>Licence terms</h2>
          <p>
            What you may do with Pro items is set out in the <a href={process.env.NEXT_PUBLIC_PRO_LICENSE_URL}>Pro licence terms</a>.
          </p>
        </>
      )}
      <h2>Troubleshooting</h2>
      <ul>
        <li>
          <strong>401 licence required</strong>: the CLI did not send a key. Check that <code>BALLMAC_LICENSE_KEY</code>{" "}
          is in <code>.env.local</code> and that the <code>@ballmac-pro</code> entry has the <code>headers</code> block.
        </li>
        <li>
          <strong>403 licence invalid</strong>: the key was mistyped or is no longer active. Copy it again from your
          receipt.
        </li>
        <li>
          <strong>Unknown registry @ballmac-pro</strong>: the <code>registries</code> block is missing from{" "}
          <code>components.json</code>.
        </li>
      </ul>
      <p>
        Pro items are covered by the Ballmac UI Pro licence, described on the <Link href="/license">licence page</Link>.
      </p>
    </DocsPage>
  )
}
