import type { Metadata } from "next"
import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import { InstallTabs } from "@/components/site/install-tabs"
import { addCommand, packageManagers, type PackageManager } from "@/lib/registry"

export const metadata: Metadata = {
  title: "Installation",
  description: "Add Ballmac UI to a React + Tailwind v4 project with the shadcn CLI: set up once, then add components by name or URL.",
  alternates: { canonical: "/docs/installation" },
}

const per = (fn: (pm: PackageManager) => string) =>
  Object.fromEntries(packageManagers.map((pm) => [pm, fn(pm)])) as Record<PackageManager, string>
const run = (pm: PackageManager, args: string) =>
  ({ pnpm: `pnpm dlx ${args}`, npm: `npx ${args}`, yarn: `yarn dlx ${args}`, bun: `bunx --bun ${args}` })[pm]

export default function InstallationPage() {
  return (
    <DocsPage title="Installation" lead="Set up once, then add any component by name. It takes about a minute.">
      <h2>1. Set up shadcn</h2>
      <p>
        Skip this if your project already has a <code>components.json</code>. Ballmac UI needs React 19 and Tailwind CSS v4.
      </p>
      <InstallTabs commands={per((pm) => run(pm, "shadcn@latest init"))} />
      <h2>2. Add the Ballmac registry</h2>
      <p>This tells the CLI where <code>@ballmac</code> components live. You only do it once per project.</p>
      <InstallTabs commands={per((pm) => run(pm, "shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{name}.json"))} />
      <p>It adds this to your <code>components.json</code>:</p>
      <CodePanel lang="json" title="components.json" code={`{\n  "registries": {\n    "@ballmac": "https://ui.ballmac.com/r/{name}.json"\n  }\n}`} />
      <h2>3. Add components</h2>
      <InstallTabs commands={per((pm) => addCommand(["button", "number-ticker"], pm))} />
      <p>
        Files are written to <code>components/ballmac/</code> and npm dependencies are installed for you. Import them like
        any other component:
      </p>
      <CodePanel code={`import { Button } from "@/components/ballmac/button"`} />
      <h2>Optional: the Ballmac theme</h2>
      <p>
        Every component uses standard shadcn CSS variables, so it follows your existing theme. To match the Ballmac look
        (neutral light mode, ink-navy dark mode, blue focus ring), add the theme:
      </p>
      <InstallTabs commands={per((pm) => addCommand(["theme"], pm))} />
      <h2>Installing without the registry entry</h2>
      <p>You can always install straight from a URL:</p>
      <CodePanel lang="bash" code="npx shadcn@latest add https://ui.ballmac.com/r/button.json" />
      <p>
        More on URLs, namespaces and updating components: <Link href="/docs/registry">CLI &amp; registry</Link>.
      </p>
    </DocsPage>
  )
}
