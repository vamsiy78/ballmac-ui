import type { Metadata } from "next"

import Link from "next/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"

export const metadata: Metadata = {
  title: "Theming",
  description: "Ballmac UI components use standard shadcn CSS variables, so they follow your theme. Add the optional Ballmac theme for its colors and motion tokens.",
  alternates: { canonical: "/docs/theming" },
}

export default function ThemingPage() {
  return (
    <DocsPage
      title="Theming"
      lead="Components use the standard shadcn CSS variables, so they take on your brand automatically. The Ballmac theme is optional."
    >
      <h2>Tokens components use</h2>
      <p>
        <code>--background</code>, <code>--foreground</code>, <code>--card</code>, <code>--primary</code>, <code>--muted</code>,{" "}
        <code>--accent</code>, <code>--border</code>, <code>--input</code>, <code>--ring</code>, <code>--destructive</code>,{" "}
        <code>--chart-1</code> to <code>--chart-5</code> and <code>--radius</code>. Change them in your{" "}
        <code>globals.css</code> and every Ballmac component follows.
      </p>
      <h2 id="presets">Presets and the builder</h2>
      <p>
        <Link href="/themes">The theme builder</Link> has twelve ready-made themes (Graphite, Ocean, Indigo, Violet, Rose, Ember, Amber, Forest,
        Teal, Sand, Mono and Midnight). Each one is a full set of light and dark tokens, with contrast checked for text, focus rings and
        charts. Install one by name, or tune hue, intensity, radius, density and font on a live preview and copy the result.
      </p>
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/theme-ocean`} />
      <p>
        Themes change the variables only. Installing a second theme replaces the first, and your components keep working because they read
        the same tokens.
      </p>
      <h2>Brand color in one line</h2>
      <p>Focus rings, selections and accents come from <code>--ring</code> and <code>--chart-1</code>:</p>
      <CodePanel
        lang="css"
        title="app/globals.css"
        code={`:root {\n  --ring: oklch(0.62 0.19 262);\n  --chart-1: oklch(0.62 0.19 262);\n}`}
      />
      <h2 id="motion-tokens">Motion tokens</h2>
      <p>
        The Ballmac theme adds <code>--bm-ease-out</code>, <code>--bm-ease-in-out</code> and <code>--bm-duration-fast</code>,{" "}
        <code>-base</code>, <code>-slow</code>. Animated components also import the same values from{" "}
        <code>@ballmac/motion-presets</code>, so CSS and Motion animations share one rhythm.
      </p>
      <h2>Dark mode</h2>
      <p>
        Components read tokens only, so dark mode is whatever your <code>.dark</code> class defines. With the Ballmac theme,
        dark mode is an ink navy rather than pure black.
      </p>
    </DocsPage>
  )
}
