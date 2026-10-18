"use client"

import { Invoice1 } from "@/components/ballmac/blocks/invoice-1/invoice-1"

export default function Invoice1Error() {
  return <Invoice1 state="error" onRetry={() => {}} />
}
