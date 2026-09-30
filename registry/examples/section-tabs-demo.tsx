"use client";
import * as React from "react";
import { SectionTabs } from "@/components/ballmac/section-tabs";
const sections = [
  { id: "st-overview", label: "Overview" },
  { id: "st-features", label: "Features" },
  { id: "st-pricing", label: "Pricing" },
  { id: "st-faq", label: "FAQ" },
];
export default function SectionTabsDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} className="h-80 w-full max-w-2xl overflow-auto rounded-xl border bg-background shadow-sm">
      <SectionTabs sections={sections} container={scroller} offset={56} />
      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className="grid min-h-56 content-start gap-2 border-b p-6 last:border-b-0">
          <h2 className="text-xl font-semibold tracking-tight">{s.label}</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            Section {i + 1}. The tab bar sticks to the top, follows your position and scrolls to a section when you choose its tab.
          </p>
        </section>
      ))}
      <div className="h-32" aria-hidden="true" />
    </div>
  );
}
