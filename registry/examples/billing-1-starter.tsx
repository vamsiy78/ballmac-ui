import { Billing1 } from "@/components/ballmac/blocks/billing-1/billing-1"

export default function Billing1Starter() {
  return (
    <Billing1
      title="Plan and billing"
      plan={{ name: "Starter", price: 12, per: "month", seats: 1, seatLimit: 1, renews: "2026-11-02" }}
      usage={[
        { label: "Projects", used: 3, limit: 3 },
        { label: "Storage", used: 4.2, limit: 10, unit: "GB" },
      ]}
      card={{ brand: "Mastercard", last4: "4444", expires: "11/27", holder: "Amara Singh" }}
      contact={{ email: "amara@northwind.dev", address: "Rua Augusta 100, Lisbon" }}
      invoices={[{ id: "INV-0210", date: "2026-10-02", amount: 12, status: "paid" }, { id: "INV-0198", date: "2026-09-02", amount: 12, status: "paid" }]}
    />
  )
}
