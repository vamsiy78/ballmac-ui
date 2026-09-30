"use client";
import * as React from "react";
import { StickyScroll } from "@/components/ballmac/sticky-scroll";
const items = ["Capture", "Organize", "Share"].map((t, i) => ({
  id: t,
  title: t,
  description: `Step ${i + 1}. Each step keeps its own visual on the left while you read.`,
  visual: <div className="grid h-full place-items-center bg-muted text-4xl font-semibold tabular-nums">{i + 1}</div>,
}));
export default function StickyScrollStates() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} role="region" tabIndex={0} aria-label="Steps" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-72 w-full max-w-3xl overflow-auto rounded-xl border bg-background p-6">
      <StickyScroll items={items} container={scroller} visualSide="left" stickyOffset={8} stepMinHeight="16rem" />
    </div>
  );
}
