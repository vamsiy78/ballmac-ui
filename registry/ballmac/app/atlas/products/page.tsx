// Ballmac UI: Atlas template route. https://ui.ballmac.com/templates/template-atlas
import type { Metadata } from "next"

import { AtlasProducts } from "@/components/ballmac/templates/atlas/atlas-products"

export const metadata: Metadata = {
  title: "Products · Atlas",
  description: "Catalog, stock and pricing.",
}

export default function Page() {
  return <AtlasProducts />
}
