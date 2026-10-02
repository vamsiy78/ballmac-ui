"use client";
import * as React from "react";
import { BackToTop } from "@/components/ballmac/back-to-top";
export default function BackToTopStates() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl border bg-card">
      <div ref={scroller} tabIndex={0} aria-label="Long page" className="h-44 overflow-auto p-4 text-sm text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50">
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} className="mb-3">Scroll to show the labelled version, line {i + 1}.</p>
        ))}
      </div>
      <BackToTop container={scroller} threshold={60} showLabel focusTarget="[aria-label='Long page']" className="absolute end-3 bottom-3" />
    </div>
  );
}
