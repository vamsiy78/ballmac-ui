import type { Metadata } from "next"

import { ThemePage } from "./theme-page"

export const metadata: Metadata = {
  title: "shadcn theme builder with contrast checks",
  description: "Twelve free shadcn themes and a live builder. Change hue, radius, density and font on real components, check contrast in light and dark, then install.",
  alternates: { canonical: "/themes" },
}

export default function ThemesPage() {
  return <ThemePage />
}
