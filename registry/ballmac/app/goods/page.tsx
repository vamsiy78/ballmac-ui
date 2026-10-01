// Ballmac UI: Goods template route. https://ui.ballmac.com/templates/template-goods
import type { Metadata } from "next"

import { GoodsHome } from "@/components/ballmac/templates/goods/goods-home"

export const metadata: Metadata = {
  title: "Kiln & Co: handmade ceramics",
  description: "Everyday ceramics thrown by hand in Bristol and fired in small batches.",
}

export default function Page() {
  return <GoodsHome />
}
