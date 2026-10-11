// Ballmac UI: Atlas template route. https://ui.ballmac.com/templates/template-atlas
import type { Metadata } from "next"
import { Suspense } from "react"

import { AtlasOrder } from "@/components/ballmac/templates/atlas/atlas-order"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `Order ${id} · Atlas`, description: "Items, timeline, fulfilment and refunds for one order." }
}

// Reading `params` is runtime data: with Cache Components (on by default in new Next.js 16.4 projects) it has to sit inside <Suspense>.
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <OrderView params={params} />
    </Suspense>
  )
}

async function OrderView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AtlasOrder orderId={id} />
}
