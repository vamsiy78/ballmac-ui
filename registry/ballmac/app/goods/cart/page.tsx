// Ballmac UI: Goods template route. https://ui.ballmac.com/templates/template-goods
import type { Metadata } from "next"

import { GoodsCartPage } from "@/components/ballmac/templates/goods/goods-cart-page"

export const metadata: Metadata = {
  title: "Your bag · Kiln & Co",
  description: "Review your pieces and apply a code.",
}

export default function Page() {
  return <GoodsCartPage demo />
}
