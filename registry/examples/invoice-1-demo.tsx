"use client"

import { Invoice1 } from "@/components/ballmac/blocks/invoice-1/invoice-1"

export default function Invoice1Demo() {
  return <Invoice1 onPay={() => new Promise((r) => setTimeout(r, 900))} onDownload={() => {}} />
}
