import type { Metadata } from "next"
import Link from "next/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import fixed from "@/lib/generated/rtl-exceptions.json"

export const metadata: Metadata = {
  title: "Right-to-left (RTL)",
  description: "Ballmac UI components, blocks and templates mirror for Arabic, Hebrew, Persian and Urdu: logical CSS, mirrored icons, direction-aware keyboard handling and an RTL toggle on every preview.",
  alternates: { canonical: "/docs/rtl" },
}

export default function RtlPage() {
  return (
    <DocsPage
      title="Right-to-left (RTL)"
      lead="Set the page direction and every component, block and template mirrors: layout, icons, keyboard arrows, sliders, menus, sheets. There is a toggle on every preview to see it."
    >
      <h2>Turn it on</h2>
      <p>
        Set <code>dir</code> and <code>lang</code> on <code>&lt;html&gt;</code>, and wrap the app in <code>DirectionProvider</code> so the Radix-based
        components (tabs, sliders, menus, radio groups) know the direction too:
      </p>
      <CodePanel
        title="app/layout.tsx"
        code={`import { DirectionProvider } from "@/lib/ballmac/direction"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <DirectionProvider dir="rtl">{children}</DirectionProvider>
      </body>
    </html>
  )
}`}
      />
      <CodePanel lang="bash" code={`npx shadcn@latest add @ballmac/direction`} />
      <p>
        Items that need the direction in code (<code>Tabs</code>, <code>Slider</code>, <code>Calendar</code>, <code>Carousel</code>,{" "}
        <code>Sidebar</code> and others) add it for you. They also read <code>&lt;html dir&gt;</code> on their own, so an app that sets only the
        attribute still works; the provider adds the Radix side. A region can have its own direction with <code>&lt;Dir dir=&quot;ltr&quot;&gt;</code>.
      </p>

      <h2>What mirrors</h2>
      <ul>
        <li>
          <strong>Layout.</strong> Spacing, borders, positions and alignment use CSS logical properties (<code>ms-</code>, <code>me-</code>, <code>ps-</code>,{" "}
          <code>pe-</code>, <code>start-</code>, <code>end-</code>, <code>text-start</code>, <code>border-s</code>, <code>rounded-e</code>), which follow{" "}
          <code>dir</code> with no JavaScript.
        </li>
        <li>
          <strong>Icons with a direction.</strong> Arrows, chevrons and back and forward icons carry <code>rtl:rotate-180</code> or{" "}
          <code>rtl:-scale-x-100</code>. Disclosure chevrons still point down when open.
        </li>
        <li>
          <strong>Keyboard.</strong> In RTL, ArrowLeft goes to the next tab, raises a slider, expands a tree node, moves a card to the next column and
          pages a carousel forward. Radix handles its primitives; the custom handlers read <code>useDirection</code>.
        </li>
        <li>
          <strong>Sides.</strong> <code>Sheet</code> and <code>Sidebar</code> take <code>side=&quot;start&quot;</code> or <code>&quot;end&quot;</code> (the new
          default), which flip. <code>&quot;left&quot;</code> and <code>&quot;right&quot;</code> stay fixed edges.
        </li>
        <li>
          <strong>Dates and numbers</strong> use the locale (see <Link href="/docs/i18n">i18n</Link>), including Arabic-Indic digits when you ask for them.
        </li>
      </ul>

      <h2>What stays left-to-right, on purpose</h2>
      <ul>
        <li>
          <strong>Code and data.</strong> Code blocks, terminals, logs, JSON, diffs, <code>.env</code> rows, API keys and keyboard shortcuts are{" "}
          <code>dir=&quot;ltr&quot;</code> inside, as in every editor. The surrounding chrome still mirrors.
        </li>
        <li>
          <strong>Charts</strong> keep their axes: time runs left to right, as Recharts draws it. Legends and text around them mirror.
        </li>
        <li>
          <strong>Motion with a named direction.</strong> Props such as <code>direction=&quot;left&quot;</code> on marquees and blur-fade describe a physical
          direction and are not flipped.
        </li>
        <li>
          <strong>Hardware frames and two decorative effects</strong> keep a fixed layout; the list is below. What you put inside a device frame follows
          the page direction. Mac windows, the menu bar and the Finder mirror, as Safari does in Arabic; the red, yellow and green lights keep their order.
        </li>
      </ul>

      <h3>Fixed-layout items</h3>
      <ul>
        {(fixed as { name: string; title: string; reason: string }[]).map((f) => (
          <li key={f.name}>
            <Link href={`/components/${f.name}`}>{f.title}</Link>: {f.reason}
          </li>
        ))}
      </ul>

      <h2>Writing RTL-safe code</h2>
      <p>The repository checks this on every build (<code>pnpm check</code> runs <code>scripts/rtl.ts</code>):</p>
      <ul>
        <li>
          Physical classes are rejected: <code>ml-</code> <code>mr-</code> <code>pl-</code> <code>pr-</code> become <code>ms-</code> <code>me-</code> <code>ps-</code>{" "}
          <code>pe-</code>; <code>left-</code> and <code>right-</code> become <code>start-</code> and <code>end-</code>; <code>text-left</code> becomes{" "}
          <code>text-start</code>; <code>border-l</code> becomes <code>border-s</code>; <code>rounded-l</code> becomes <code>rounded-s</code>. Centering with{" "}
          <code>left-1/2 -translate-x-1/2</code> is symmetric and allowed.
        </li>
        <li>
          Directional icons from lucide-react must have an <code>rtl:</code> class. <code>npx tsx scripts/rtl.ts --fix</code> rewrites the safe cases.
        </li>
        <li>
          Anything that is physical on purpose carries a comment containing <code>rtl-fixed</code> and a reason, or is listed in{" "}
          <code>scripts/rtl-exceptions.json</code>.
        </li>
        <li>
          A <code>translate-x</code> nudge needs its mirror: <code>group-hover:translate-x-1 rtl:group-hover:-translate-x-1</code>.
        </li>
      </ul>

      <h2>Testing</h2>
      <p>
        Every component and block preview has a right-to-left toggle in its toolbar. Any preview opens right-to-left with{" "}
        <code>/preview/&lt;name&gt;?dir=rtl</code>. <code>pnpm rtl:sweep</code> loads every preview in both directions and reports any whose layout is
        not the mirror image of the other, or that overflows only in RTL.
      </p>

      <h2>Known limits</h2>
      <ul>
        <li>Templates mirror, but their sample copy is English and written into the files, so translate it as you would any content.</li>
        <li>
          Recharts draws SVG in its own coordinates: axes do not mirror. Pass <code>reversed</code> to an axis yourself if your design needs it.
        </li>
        <li>The marquee and blur-fade <code>direction</code> props are physical. Choose the value you want for your reading direction.</li>
      </ul>
    </DocsPage>
  )
}
