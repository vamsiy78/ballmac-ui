import Link from "@/components/site/link"

import { ThemeBuilder } from "@/components/themes/theme-builder"
import { Eyebrow } from "@/components/site/section-heading"
import { SITE_URL } from "@/lib/registry"
import { DEFAULT_SPEC, PRESETS, type PresetSystem, type ThemePreset } from "@ballmac-ui/theme-engine"

/** The builder page, optionally opened on one colour theme or one design system. Server-rendered, then hydrated. */
export function ThemePage({ preset, system }: { preset?: ThemePreset; system?: PresetSystem }) {
  const opened = system ?? preset
  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-12 sm:px-6">
      <header className="max-w-3xl space-y-3">
        <Eyebrow>
          <Link href={system ? "/presets" : "/themes"} className="hover:text-foreground">
            {system ? "Presets" : "Themes"}
          </Link>
          {opened ? ` / ${opened.title}` : ""}
        </Eyebrow>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{system ? `${system.title} preset` : preset ? `${preset.title} theme` : "Theme builder"}</h1>
        <p className="text-muted-foreground max-w-2xl text-[1.05rem] leading-7 text-balance sm:text-base">
          {opened
            ? `${opened.description} Tune it below, check it in light and dark, then install it${system ? " with one command or its code" : ""}.`
            : `Fifteen complete design systems, twelve colour themes and a builder with a live preview on real components. Colour, shape, typeface, platform feel (macOS, iOS, Windows) and motion are all part of the design, and contrast is checked for you, in light and dark. Free, and nothing is stored: your design lives in a link and a 16-character code.`}
        </p>
      </header>
      <ThemeBuilder initial={opened?.spec ?? PRESETS[1]?.spec ?? DEFAULT_SPEC} presetSlug={preset?.slug} systemSlug={system?.slug} siteUrl={SITE_URL} />
    </div>
  )
}
