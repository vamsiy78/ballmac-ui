// Ballmac UI: Goods template route. https://ui.ballmac.com/templates/template-goods
import type { Metadata } from "next"

import { GoodsCheckout } from "@/components/ballmac/templates/goods/goods-checkout"

export const metadata: Metadata = {
  title: "Checkout · Kiln & Co",
  description: "Delivery and payment.",
}

export default function Page() {
  return <GoodsCheckout demo />
}
