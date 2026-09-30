"use client";
import * as React from "react";
import { CookieConsent } from "@/components/ballmac/cookie-consent";
export default function CookieConsentStates() {
  const [open, setOpen] = React.useState(true);
  const [choice, setChoice] = React.useState("No choice yet");
  return (
    <div className="relative h-80 w-full max-w-md overflow-hidden rounded-xl border bg-muted/30">
      <div className="grid gap-2 p-5 text-sm">
        <p className="font-medium" aria-live="polite">{choice}</p>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className="w-fit rounded-md border bg-background px-3 py-1.5 text-[13px] font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
            Show banner again
          </button>
        )}
      </div>
      <CookieConsent
        open={open}
        placement="bottom-center"
        className="absolute bottom-3"
        title="Cookies"
        description="Choose how we may use cookies."
        categories={[
          { id: "necessary", label: "Necessary", description: "Required for the site to work.", required: true },
          { id: "analytics", label: "Analytics", description: "Anonymous usage statistics." },
        ]}
        onConsent={(c) => {
          setChoice(`Saved: ${Object.entries(c).map(([k, v]) => `${k} ${v ? "on" : "off"}`).join(", ")}`);
          setOpen(false);
        }}
      />
    </div>
  );
}
