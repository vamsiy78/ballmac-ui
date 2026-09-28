import type { Metadata } from "next"
import Link from "next/link"

import { DocsPage } from "@/components/site/docs-page"

export const metadata: Metadata = {
  title: "Introduction",
  description: "Ballmac UI is a shadcn registry of accessible React and Tailwind components, blocks and templates that you and your AI agent install as code.",
  alternates: { canonical: "/docs" },
}

export default function IntroductionPage() {
  return (
    <DocsPage
      title="Introduction"
      lead="Ballmac UI is a collection of accessible React and Tailwind CSS components, blocks and templates, built in one design language and distributed as a shadcn registry."
    >
      <p>
        You don&apos;t install Ballmac UI as a package. You add the components you need with the shadcn CLI, and the source
        lands in your project, ready to read and change. Your AI coding agent can do the same through the shadcn MCP server.
      </p>
      <h2>What makes it different</h2>
      <ul>
        <li>
          <strong>One design language.</strong> Primitives, motion, AI interfaces and developer components share tokens,
          spacing, focus states and motion curves.
        </li>
        <li>
          <strong>No collisions.</strong> Everything installs into <code>components/ballmac</code>, so it never overwrites
          your shadcn/ui files. Dependencies are declared honestly and checked on every build.
        </li>
        <li>
          <strong>Made for AI agents.</strong> Every item carries a description, when to use it, when not to, what it
          composes with, and keyboard notes, available through MCP and <Link href="/llms.txt">llms.txt</Link>.
        </li>
        <li>
          <strong>Verified installs.</strong> Each release installs every item into a fresh Next.js app, then type-checks
          and builds it.
        </li>
      </ul>
      <h2>Requirements</h2>
      <ul>
        <li>React 19 and Tailwind CSS v4</li>
        <li>
          A project set up with <code>shadcn init</code> (it creates <code>components.json</code> and <code>lib/utils</code>)
        </li>
      </ul>
      <p>
        Next: <Link href="/docs/installation">install your first component</Link>, or{" "}
        <Link href="/docs/mcp">connect your AI agent</Link>.
      </p>
    </DocsPage>
  )
}
