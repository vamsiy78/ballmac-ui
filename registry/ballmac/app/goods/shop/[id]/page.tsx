// Ballmac UI: Goods template route. https://ui.ballmac.com/templates/template-goods
import type { Metadata } from "next"

import { GoodsProduct } from "@/components/ballmac/templates/goods/goods-product"

export const metadata: Metadata = {
  title: "Kiln & Co: product",
  description: "A handmade ceramic piece from Kiln & Co.",
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GoodsProduct slug={id} />
}
