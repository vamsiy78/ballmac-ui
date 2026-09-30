"use client";
import * as React from "react";
import { ContainerScroll } from "@/components/ballmac/container-scroll";
export default function ContainerScrollStates() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} role="region" tabIndex={0} aria-label="Showcase" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-72 w-full max-w-sm overflow-auto rounded-xl border bg-background">
      <div className="h-10" aria-hidden="true" />
      <ContainerScroll container={scroller} tilt={35} title={<h2 className="text-xl font-semibold">Steeper tilt</h2>} className="px-4">
        <div className="grid h-32 place-items-center text-sm text-muted-foreground">Any content: video, screenshot, live demo</div>
      </ContainerScroll>
      <div className="h-32" aria-hidden="true" />
    </div>
  );
}
