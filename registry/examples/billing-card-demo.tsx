"use client";
import { BillingCard } from "@/components/ballmac/billing-card";
export default function BillingCardDemo() {
  return (
    <BillingCard
      className="max-w-lg"
      plan={{ name: "Team", price: 49, interval: "month", status: "active", renewsOn: "2026-10-28", seats: { used: 8, total: 10 } }}
      paymentMethod={{ brand: "Visa", last4: "4242", expires: "08/28" }}
      invoices={[
        { id: "INV-2041", date: "2026-09-28", amount: 49, status: "paid", href: "#inv-2041" },
        { id: "INV-2012", date: "2026-08-28", amount: 49, status: "paid", href: "#inv-2012" },
        { id: "INV-1987", date: "2026-07-28", amount: 49, status: "paid", href: "#inv-1987" },
      ]}
      onChangePlan={() => undefined}
      onUpdatePayment={() => undefined}
      onCancel={() => undefined}
    />
  );
}
