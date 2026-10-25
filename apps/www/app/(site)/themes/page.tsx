import type { Metadata } from "next"

import { ThemePage } from "./theme-page"

export const metadata: Metadata = {
  title: "shadcn theme builder with contrast checks",
  description: "Twelve free shadcn themes and a live builder. Change colour, shape, platform feel and motion on real components, check contrast, then install.",
  alternates: { canonical: "/themes" },
}

export default function ThemesPage() {
  return <ThemePage />
}
