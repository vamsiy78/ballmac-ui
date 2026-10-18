import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getSystem, SYSTEMS } from "@ballmac-ui/theme-engine"

import { seoDescription } from "@/lib/seo"

import { ThemePage } from "../../themes/theme-page"

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/presets/[slug]">): Promise<Metadata> {
  const system = getSystem((await params).slug)
  if (!system) return {}
  return {
    title: `${system.title} preset for shadcn and Tailwind`,
    description: seoDescription(`${system.description} Free; preview it on real components and install with one shadcn command.`),
    alternates: { canonical: `/presets/${system.slug}` },
  }
}

export default async function SystemPage({ params }: PageProps<"/presets/[slug]">) {
  const system = getSystem((await params).slug)
  if (!system) notFound()
  return <ThemePage system={system} />
}
