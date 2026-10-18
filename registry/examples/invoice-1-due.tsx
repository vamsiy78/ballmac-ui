"use client"

import { Invoice1, type Invoice1Data } from "@/components/ballmac/blocks/invoice-1/invoice-1"

const invoice: Invoice1Data = {
  number: "INV-2044",
  issued: "2026-10-12",
  due: "2026-10-26",
  from: { name: "Acme Studio Ltd", lines: ["Rua da Prata 120", "1100-420 Lisboa, Portugal", "VAT PT 509 123 456"] },
  to: { name: "Orbit Labs", lines: ["Attn: Finance", "Av. Paulista 1578", "São Paulo, Brazil"] },
  lines: [{ id: "1", description: "Monthly design retainer", detail: "October", quantity: 1, unitPrice: 4800 }, { id: "2", description: "Extra review day", quantity: 1, unitPrice: 900 }],
  taxPercent: 23,
  paymentDetails: [{ label: "IBAN", value: "PT50 0002 0123 1234 5678 9015 4" }, { label: "Reference", value: "INV-2044" }],
}

export default function Invoice1Due() {
  return <Invoice1 invoice={invoice} currency="EUR" locale="en-GB" onPay={() => Promise.reject(new Error("Your card was declined. You have not been charged."))} />
}
