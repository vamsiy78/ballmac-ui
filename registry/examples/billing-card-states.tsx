"use client";
import { BillingCard } from "@/components/ballmac/billing-card";
export default function BillingCardStates() {
  return (
    <div className="grid w-full max-w-lg gap-5">
      <BillingCard
        plan={{ name: "Team", price: 49, interval: "month", status: "past_due", renewsOn: "2026-10-05" }}
        paymentMethod={{ brand: "Mastercard", last4: "0087", expires: "01/26" }}
        invoices={[{ id: "INV-2041", date: "2026-09-28", amount: 49, status: "failed" }]}
        onUpdatePayment={() => undefined}
      />
      <BillingCard plan={{ name: "Pro trial", price: 0, interval: "month", status: "trialing", trialEndsOn: "2026-10-12" }} onChangePlan={() => undefined} />
    </div>
  );
}
