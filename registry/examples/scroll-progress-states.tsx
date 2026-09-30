"use client";
import * as React from "react";
import { ScrollProgress } from "@/components/ballmac/scroll-progress";
export default function ScrollProgressStates() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl border bg-card">
      <ScrollProgress container={scroller} position="bottom" thickness={5} className="absolute" />
      <div ref={scroller} role="region" tabIndex={0} aria-label="Long text" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-44 overflow-auto p-4 pb-6 text-sm text-muted-foreground">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i} className="mb-3">A thicker bar along the bottom edge. Keep scrolling to fill it, line {i + 1}.</p>
        ))}
      </div>
    </div>
  );
}
