import type { Metadata } from "next"

import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { Eyebrow } from "@/components/site/section-heading"
import { FeelGallery } from "@/components/feels/feel-gallery"
import { FeelShowcase } from "@/components/feels/feel-showcase"

export const metadata: Metadata = {
  title: "Platform feels for shadcn: macOS, iOS and Windows",
  description: "One set of components that handle like macOS, iOS or Windows: sizes, corners, focus ring, shadows, menus, sidebars and window chrome. For Tauri and Electron apps and the web. Free.",
  alternates: { canonical: "/feels" },
}

const points = [
  { title: "Not just a skin", body: "Control heights, menu rows, text scale, focus ring, shadows, frosted surfaces, press feedback, scrollbars and motion all change together, from one setting." },
  { title: "Works with your colours", body: "A feel never touches colour. Ocean with the Windows feel, Violet with the macOS feel: any theme, any feel." },
  { title: "Picks itself", body: "Install feel-auto and a Mac gets macOS, a Windows PC gets Windows, a phone gets iOS, before the first paint. People can override it." },
  { title: "Real window chrome", body: "app-window is the title bar of a Tauri or Electron app: traffic lights or caption buttons, a drag region, double-click to maximize." },
]

export default function FeelsPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-16 px-4 py-12 sm:px-6">
      <header className="max-w-3xl space-y-4">
        <Eyebrow>Platform feels</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">One app, every platform.</h1>
        <p className="text-muted-foreground text-lg leading-8 text-balance">
          Pick macOS, iOS or Windows and every component handles like it: sizes, corners, focus, shadows, menus, sidebars and window controls. Free, and it works on top of any colour theme.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-sm">
          <Link href="/themes#feels" className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium">
            Try it in the builder
          </Link>
          <Link href="/docs/feels" className="hover:bg-accent rounded-lg border px-4 py-2 font-medium">
            Read the docs
          </Link>
        </div>
      </header>

      <section aria-label="Live feel switcher">
        <FeelShowcase />
      </section>

      <section aria-labelledby="why" className="space-y-6">
        <h2 id="why" className="text-2xl font-semibold tracking-tight">
          What a feel changes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {points.map((p) => (
            <div key={p.title} className="bg-card rounded-2xl border p-5">
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-6">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="compare" className="space-y-6">
        <div>
          <h2 id="compare" className="text-2xl font-semibold tracking-tight">
            The same app, four feels
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">Identical markup. Only the handling differs.</p>
        </div>
        <FeelGallery />
      </section>

      <section aria-labelledby="start" className="grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 id="start" className="text-2xl font-semibold tracking-tight">
            Start in a minute
          </h2>
          <p className="text-muted-foreground text-sm leading-6">
            Install the window and let the device choose, or install a single feel. Then wire the buttons to Tauri or Electron; the{" "}
            <Link href="/docs/feels#desktop" className="underline underline-offset-4">
              docs
            </Link>{" "}
            show both.
          </p>
          <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/feel-auto @ballmac/app-window`} />
          <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/feel-windows`} />
        </div>
        <div className="space-y-3">
          <CodePanel
            lang="tsx"
            title="Tauri v2"
            code={`<AppWindow
  onClose={() => win.close()}
  onMinimize={() => win.minimize()}
  onMaximize={() => win.toggleMaximize()}
>
  <AppWindowTitleBar title="Notes" />
  <AppWindowContent>…</AppWindowContent>
</AppWindow>`}
          />
          <p className="text-muted-foreground text-xs leading-5">
            These are web components that feel like each platform, not native controls. Ballmac UI is not affiliated with Apple or Microsoft.
          </p>
        </div>
      </section>
    </div>
  )
}
