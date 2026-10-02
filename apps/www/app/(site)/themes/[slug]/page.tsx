import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPreset, PRESETS } from "@ballmac-ui/theme-engine"

import { ThemePage } from "../theme-page"

export function generateStaticParams() {
  return PRESETS.map((p) => ({ slug: p.slug }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/themes/[slug]">): Promise<Metadata> {
  const preset = getPreset((await params).slug)
  if (!preset) return {}
  return {
    title: `${preset.title} theme for shadcn and Tailwind`,
    description: `${preset.description} Free; preview it on real components and install with the shadcn CLI.`,
    alternates: { canonical: `/themes/${preset.slug}` },
  }
}

export default async function PresetPage({ params }: PageProps<"/themes/[slug]">) {
  const preset = getPreset((await params).slug)
  if (!preset) notFound()
  return <ThemePage preset={preset} />
}
