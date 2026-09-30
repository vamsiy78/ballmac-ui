"use client";
import * as React from "react";
import { Compass, CreditCard, Home, MessageCircle } from "lucide-react";
import { FloatingNav } from "@/components/ballmac/floating-nav";
const items = [
  { value: "home", label: "Home", href: "#home", icon: <Home /> },
  { value: "explore", label: "Explore", href: "#explore", icon: <Compass /> },
  { value: "pricing", label: "Pricing", href: "#pricing", icon: <CreditCard /> },
  { value: "contact", label: "Contact", href: "#contact", icon: <MessageCircle /> },
];
export default function FloatingNavDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-sm">
      <FloatingNav items={items} autoHide scrollContainer={scroller} className="absolute" />
      <div ref={scroller} role="region" tabIndex={0} aria-label="Page content" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-full overflow-auto px-6 pt-20 pb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Design that gets out of the way</h2>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">Scroll down and the bar slips away; scroll up and it returns. Click an item and the highlight glides to it.</p>
        <div className="mt-5 grid gap-3">
          {["One", "Two", "Three", "Four", "Five"].map((t) => (
            <div key={t} className="rounded-xl border bg-card p-5 text-sm">Section {t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
