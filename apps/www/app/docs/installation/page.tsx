import type { Metadata } from "next"

import { CodePanel } from "@/components/site/code-panel"
import { InstallTabs } from "@/components/site/install-tabs"
import { Eyebrow } from "@/components/site/section-heading"
import { addCommand, packageManagers, type PackageManager } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Installation",
  description: "Add Ballmac UI to a React + Tailwind v4 project with the shadcn CLI: set up once, then add components by name or URL.",
  alternates: { canonical: "/docs/installation" },
}

const cmd = (names: string[]) =>
  Object.fromEntries(packageManagers.map((pm) => [pm, addCommand(names, pm)])) as Record<PackageManager, string>
const init = { pnpm: "pnpm dlx shadcn@latest init", npm: "npx shadcn@latest init", yarn: "yarn dlx shadcn@latest init", bun: "bunx --bun shadcn@latest init" }

export default function InstallationPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
      <header className="space-y-4">
        <Eyebrow>Docs</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Installation</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Ballmac UI is a shadcn registry. You copy components into your project with the shadcn CLI and own the code.
          It needs React 19 and Tailwind CSS v4.
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">1. Set up shadcn (once)</h2>
        <p className="text-muted-foreground">Skip this if your project already has a <code className="font-mono text-sm">components.json</code>.</p>
        <InstallTabs commands={init} />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">2. Optional: use the Ballmac theme</h2>
        <p className="text-muted-foreground">
          Every component works with your existing shadcn theme. To match the Ballmac look, add the theme tokens:
        </p>
        <InstallTabs commands={cmd(["theme"])} />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">3. Add components</h2>
        <InstallTabs commands={cmd(["button", "number-ticker"])} />
        <p className="text-muted-foreground">Files are written to <code className="font-mono text-sm">components/ballmac/</code>, and npm dependencies are installed for you.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Before @ballmac is in the shadcn index</h2>
        <p className="text-muted-foreground">
          Add the registry to <code className="font-mono text-sm">components.json</code>, or install by URL:
        </p>
        <CodePanel lang="json" code={`{\n  "registries": {\n    "@ballmac": "https://ui.ballmac.com/r/{name}.json"\n  }\n}`} title="components.json" />
        <CodePanel lang="bash" code="npx shadcn@latest add https://ui.ballmac.com/r/button.json" />
      </section>
    </article>
  )
}
