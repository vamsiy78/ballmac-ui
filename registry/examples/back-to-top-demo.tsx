"use client";
import * as React from "react";
import { BackToTop } from "@/components/ballmac/back-to-top";
export default function BackToTopDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-sm">
      <div ref={scroller} tabIndex={0} aria-label="Release notes" className="h-72 overflow-auto p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50">
        <h2 className="text-lg font-semibold tracking-tight">Release notes</h2>
        <p className="mt-1 text-sm text-muted-foreground">Scroll down to reveal the button. The ring fills as you read.</p>
        <ul className="mt-4 grid gap-3">
          {Array.from({ length: 14 }, (_, i) => (
            <li key={i} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">Version 1.{14 - i}</p>
              <p className="text-muted-foreground">Fixes, polish and small improvements across the app.</p>
            </li>
          ))}
        </ul>
      </div>
      <BackToTop container={scroller} threshold={120} focusTarget="[aria-label='Release notes']" className="absolute" />
    </div>
  );
}
