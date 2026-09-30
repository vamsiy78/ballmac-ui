"use client";
import * as React from "react";
import { SectionTabs } from "@/components/ballmac/section-tabs";
const sections = ["Details", "Specs", "Reviews", "Shipping", "Returns", "Support"].map((label) => ({ id: `sts-${label.toLowerCase()}`, label }));
export default function SectionTabsStates() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} className="h-64 w-full max-w-xs overflow-auto rounded-xl border bg-background">
      <SectionTabs sections={sections} container={scroller} offset={56} variant="pill" label="Product sections" />
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="min-h-40 border-b p-4">
          <h2 className="font-semibold">{s.label}</h2>
          <p className="text-sm text-muted-foreground">Narrow screens scroll the tabs sideways and keep the active one centered.</p>
        </section>
      ))}
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}
