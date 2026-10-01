// Ballmac UI: Goods template route. https://ui.ballmac.com/templates/template-goods
import type { Metadata } from "next"

import { GoodsShop } from "@/components/ballmac/templates/goods/goods-shop"

export const metadata: Metadata = {
  title: "Shop · Kiln & Co",
  description: "Mugs, bowls, vases and plates in five glazes.",
}

export default function Page() {
  return <GoodsShop />
}
