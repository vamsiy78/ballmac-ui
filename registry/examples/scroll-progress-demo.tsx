"use client";
import * as React from "react";
import { ScrollProgress } from "@/components/ballmac/scroll-progress";
export default function ScrollProgressDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-xl border bg-card shadow-sm">
      <ScrollProgress container={scroller} className="absolute" />
      <div ref={scroller} role="region" tabIndex={0} aria-label="Article" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-72 overflow-auto px-6 py-6">
        <article className="grid gap-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Designing calm software</h2>
          {Array.from({ length: 9 }, (_, i) => (
            <p key={i}>
              Good interfaces make the next step obvious. They keep important information in view, hide what is not needed yet, and
              respond quickly enough that people never wonder whether something worked. Paragraph {i + 1} of nine.
            </p>
          ))}
        </article>
      </div>
    </div>
  );
}
