"use client";
import * as React from "react";
import { PlanSelector, type PlanOption } from "@/components/ballmac/plan-selector";
const plans: PlanOption[] = [
  { id: "basic", name: "Basic", price: { monthly: 9, yearly: 7 }, features: ["1 workspace", "Email support"] },
  { id: "plus", name: "Plus", price: { monthly: 19, yearly: 15 }, features: ["5 workspaces", "Priority support"] },
  { id: "enterprise", name: "Enterprise", price: { monthly: 99, yearly: 89 }, features: ["Unlimited workspaces", "Custom contract"], disabled: true },
];
export default function PlanSelectorStates() {
  const [value, setValue] = React.useState("plus");
  return (
    <div className="grid gap-3">
      <PlanSelector plans={plans} value={value} onValueChange={setValue} defaultBilling="monthly" legend="Plan" className="max-w-2xl" />
      <p className="text-center text-sm text-muted-foreground" aria-live="polite">Selected: {plans.find((p) => p.id === value)?.name}. Enterprise is unavailable in this demo.</p>
    </div>
  );
}
