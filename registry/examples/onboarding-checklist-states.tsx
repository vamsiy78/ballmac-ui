"use client";
import { OnboardingChecklist } from "@/components/ballmac/onboarding-checklist";
const steps = [
  { id: "a", title: "Verify your email" },
  { id: "b", title: "Set up two-step sign-in" },
  { id: "c", title: "Add a payment method" },
];
export default function OnboardingChecklistStates() {
  return <OnboardingChecklist steps={steps} defaultCompleted={["a", "b", "c"]} title="Account setup" completeMessage="Your account is secure and ready." onDismiss={() => undefined} className="max-w-sm" />;
}
