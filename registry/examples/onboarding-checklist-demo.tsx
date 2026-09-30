"use client";
import { OnboardingChecklist } from "@/components/ballmac/onboarding-checklist";
const steps = [
  { id: "profile", title: "Complete your profile", description: "Add your name and a photo so teammates recognize you." },
  { id: "project", title: "Create your first project", description: "Projects keep tasks, files and conversations together. Start from a template or a blank page.", action: { label: "Create project" } },
  { id: "invite", title: "Invite your team", description: "Work is better together. Send invitations by email and set a role for each person.", action: { label: "Invite teammates" } },
  { id: "integrate", title: "Connect your tools", description: "Bring in calendars, chat and code hosting so updates flow in automatically." },
  { id: "billing", title: "Choose a plan", description: "Stay on the free plan or pick one that fits your team." },
];
export default function OnboardingChecklistDemo() {
  return <OnboardingChecklist steps={steps} defaultCompleted={["profile"]} defaultOpenId="project" className="max-w-md" />;
}
