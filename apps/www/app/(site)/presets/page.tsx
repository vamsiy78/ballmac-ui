import type { Metadata } from "next"

import Link from "@/components/site/link"
import { Eyebrow } from "@/components/site/section-heading"
import { SystemGallery } from "@/components/themes/system-gallery"
import { SYSTEMS } from "@ballmac-ui/theme-engine"

export const metadata: Metadata = {
  title: "shadcn presets: complete design systems",
  description: `${SYSTEMS.length} complete design systems for shadcn: colour, shape, typeface, platform feel and motion in one command. Preview on real components, check contrast, install, or make your own with a 16-character code. Free.`,
  alternates: { canonical: "/presets" },
}

const parts = [
  { title: "Colour", body: "Light and dark tokens from one hue, with contrast measured for every pairing, charts included." },
  { title: "Shape and type", body: "Corner radius, density and a real typeface, installed from Fontsource so the files are served from your own app." },
  { title: "Platform feel", body: "Control sizes, focus ring, shadows and materials that handle like macOS, iOS or Windows." },
  { title: "Motion", body: "Speed, bounce, travel and stagger as tokens, with a reduced-motion fallback that is built in." },
]

export default function PresetsPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-12 px-4 py-12 sm:px-6">
      <header className="max-w-3xl space-y-4">
        <Eyebrow>Presets</Eyebrow>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">A whole design system in one command.</h1>
        <p className="text-muted-foreground text-lg leading-8 text-balance">
          Pick one, run one command, and your app has its colours, corners, typeface, platform feel and motion. Every preset has a 16-character code, so a design you build is one line you can paste anywhere. Free, and nothing is stored: the code is the design.
        </p>
        <p className="text-sm">
          <Link href="/themes" className="font-medium underline-offset-4 hover:underline">
            Open the builder
          </Link>{" "}
          <span className="text-muted-foreground">to make your own, or read the</span>{" "}
          <Link href="/docs/guides/presets" className="font-medium underline-offset-4 hover:underline">
            presets guide
          </Link>
          .
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {parts.map((p) => (
          <li key={p.title} className="rounded-xl border p-4">
            <h2 className="text-sm font-semibold">{p.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">{p.body}</p>
          </li>
        ))}
      </ul>
      <SystemGallery />
    </div>
  )
}
