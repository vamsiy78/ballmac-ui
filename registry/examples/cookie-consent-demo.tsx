"use client";
import { CookieConsent } from "@/components/ballmac/cookie-consent";
const categories = [
  { id: "necessary", label: "Strictly necessary", description: "Keep the site secure and remember your choices.", required: true },
  { id: "analytics", label: "Analytics", description: "Help us understand which pages are useful." },
  { id: "marketing", label: "Marketing", description: "Show relevant offers on other sites." },
];
export default function CookieConsentDemo() {
  return (
    <div className="relative h-[31rem] w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-sm">
      <div aria-hidden="true" className="grid gap-3 p-6 opacity-70">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="h-20 rounded-lg bg-muted" />
          <div className="h-20 rounded-lg bg-muted" />
          <div className="h-20 rounded-lg bg-muted" />
        </div>
      </div>
      <CookieConsent open categories={categories} policyHref="#cookies" className="absolute bottom-4 start-4" />
    </div>
  );
}
