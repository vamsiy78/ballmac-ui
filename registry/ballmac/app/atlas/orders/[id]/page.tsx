// Ballmac UI: Atlas template route. https://ui.ballmac.com/templates/template-atlas
import type { Metadata } from "next"

import { AtlasOrder } from "@/components/ballmac/templates/atlas/atlas-order"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `Order ${id} · Atlas`, description: "Items, timeline, fulfilment and refunds for one order." }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AtlasOrder orderId={id} />
}
