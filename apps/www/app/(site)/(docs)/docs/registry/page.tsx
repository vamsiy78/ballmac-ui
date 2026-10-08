import type { Metadata } from "next"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import { SITE_URL } from "@/lib/registry"

export const metadata: Metadata = {
  title: "CLI & registry",
  description: "How the Ballmac UI shadcn registry works: namespaces, direct URLs, searching and viewing items, updating installed code, and the JSON format.",
  alternates: { canonical: "/docs/registry" },
}

export default function RegistryPage() {
  return (
    <DocsPage
      title="CLI & registry"
      lead="Ballmac UI is a standard shadcn registry. Everything the shadcn CLI can do with a registry, it can do with @ballmac."
    >
      <h2>Addresses</h2>
      <p>Every item has a permanent name and a JSON URL:</p>
      <CodePanel
        lang="bash"
        code={`# by namespace: @ballmac is in the official shadcn registry directory, no setup\nnpx shadcn@latest add @ballmac/button\n\n# by URL, no setup needed\nnpx shadcn@latest add ${SITE_URL}/r/button.json`}
      />
      <h2>Search and inspect before installing</h2>
      <CodePanel
        lang="bash"
        code={`# list or search everything in @ballmac\nnpx shadcn@latest search @ballmac -q "chat"\n\n# see an item's files, dependencies and docs\nnpx shadcn@latest view @ballmac/prompt-input`}
      />
      <h2>Updating installed components</h2>
      <p>
        Components are your code once installed, so updates never happen silently. To see what changed in a newer version,
        compare before overwriting:
      </p>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/button --diff\nnpx shadcn@latest add @ballmac/button --overwrite`} />
      <h2>Where files go</h2>
      <ul>
        <li>
          Components: <code>components/ballmac/</code> (respects your <code>components</code> alias and <code>src/</code> folder)
        </li>
        <li>
          Blocks: <code>components/ballmac/blocks/&lt;name&gt;/</code>
        </li>
        <li>
          Hooks and helpers: <code>hooks/ballmac/</code>, <code>lib/ballmac/</code>
        </li>
      </ul>
      <p>
        Ballmac UI never writes to <code>components/ui</code>, so it can&apos;t overwrite your shadcn/ui components.
      </p>
      <h2>Dependencies</h2>
      <p>
        Each item declares the npm packages it imports and the registry items it builds on (for example{" "}
        <code>@ballmac/motion-presets</code> or shadcn&apos;s <code>utils</code>). The CLI installs them for you. Every build
        checks that declared dependencies match the actual imports.
      </p>
      <h2>JSON format</h2>
      <p>
        Items follow the official <a href="https://ui.shadcn.com/docs/registry">shadcn registry schema</a>. The full index is at{" "}
        <a href={`${SITE_URL}/r/registry.json`}>{`${SITE_URL}/r/registry.json`}</a>. Each item&apos;s <code>meta</code> adds
        Ballmac fields for tools and agents: tier, tags, version, when to use it, what it composes with, and keyboard notes.
      </p>
      <h2>A registry for your own team</h2>
      <p>
        This is the same setup we build for clients: your components, in your brand, installable with one command and available to AI
        agents over MCP. <a href="https://ballmac.com/services?offer=registry&ref=ui-registry#start">Talk to us about it</a>.
      </p>
    </DocsPage>
  )
}
