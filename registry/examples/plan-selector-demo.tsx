"use client";
import { PlanSelector, type PlanOption } from "@/components/ballmac/plan-selector";
const plans: PlanOption[] = [
  { id: "starter", name: "Starter", description: "For individuals getting going.", price: { monthly: 0, yearly: 0 }, features: ["3 projects", "1 GB storage", "Community support"] },
  { id: "team", name: "Team", description: "For small teams that ship together.", price: { monthly: 24, yearly: 19 }, priceNote: "per user", highlight: "Most popular", features: ["Unlimited projects", "100 GB storage", "Automations", "Priority email support"] },
  { id: "scale", name: "Scale", description: "For larger organizations.", price: { monthly: 59, yearly: 49 }, priceNote: "per user", features: ["Everything in Team", "Single sign-on", "Audit logs", "Dedicated support"] },
];
export default function PlanSelectorDemo() {
  return <PlanSelector plans={plans} defaultValue="team" className="max-w-4xl pt-3" />;
}
