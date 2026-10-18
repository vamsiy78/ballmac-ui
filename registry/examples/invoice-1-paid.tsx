"use client"

import { Invoice1, type Invoice1Data } from "@/components/ballmac/blocks/invoice-1/invoice-1"

const invoice: Invoice1Data = {
  number: "INV-2038",
  issued: "2026-09-02",
  due: "2026-09-16",
  paidOn: "2026-09-11",
  from: { name: "Acme Studio Ltd", lines: ["Rua da Prata 120", "1100-420 Lisboa, Portugal"] },
  to: { name: "Lumen Health", lines: ["Attn: Accounts", "14 Carnaby St", "London W1F 9PS"] },
  lines: [{ id: "1", description: "Brand refresh", detail: "Logo, colors and guidelines", quantity: 1, unitPrice: 7400 }, { id: "2", description: "Social templates", quantity: 12, unitPrice: 65 }],
  taxPercent: 20,
  note: "Thank you, paid in full.",
}

export default function Invoice1Paid() {
  return <Invoice1 invoice={invoice} onDownload={() => {}} />
}
