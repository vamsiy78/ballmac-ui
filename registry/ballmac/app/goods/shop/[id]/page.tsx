// Ballmac UI: Goods template route. https://ui.ballmac.com/templates/template-goods
import type { Metadata } from "next"
import { Suspense } from "react"

import { GoodsProduct } from "@/components/ballmac/templates/goods/goods-product"

export const metadata: Metadata = {
  title: "Kiln & Co: product",
  description: "A handmade ceramic piece from Kiln & Co.",
}

// Reading `params` is runtime data: with Cache Components (on by default in new Next.js 16.4 projects) it has to sit inside <Suspense>.
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <ProductView params={params} />
    </Suspense>
  )
}

async function ProductView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GoodsProduct slug={id} />
}
