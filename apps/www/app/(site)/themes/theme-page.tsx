import Link from "next/link"

import { ThemeBuilder } from "@/components/themes/theme-builder"
import { Eyebrow } from "@/components/site/section-heading"
import { SITE_URL } from "@/lib/registry"
import { DEFAULT_SPEC, PRESETS, type ThemePreset } from "@ballmac-ui/theme-engine"

/** The builder page, optionally opened on one preset. Server-rendered, then hydrated. */
export function ThemePage({ preset }: { preset?: ThemePreset }) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-12 sm:px-6">
      <header className="max-w-3xl space-y-3">
        <Eyebrow>
          <Link href="/themes" className="hover:text-foreground">
            Themes
          </Link>
          {preset ? ` / ${preset.title}` : ""}
        </Eyebrow>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{preset ? `${preset.title} theme` : "Theme builder"}</h1>
        <p className="text-muted-foreground max-w-2xl text-[1.05rem] leading-7 text-balance sm:text-base">
          {preset
            ? `${preset.description} Tune it below, check it in light and dark, then install it.`
            : `Twelve ready-made themes and a builder with a live preview on real components. Contrast is checked for you, in light and dark. Free, and nothing is stored: your design lives in the link.`}
        </p>
      </header>
      <ThemeBuilder initial={preset?.spec ?? PRESETS[1]?.spec ?? DEFAULT_SPEC} presetSlug={preset?.slug} siteUrl={SITE_URL} />
    </div>
  )
}
