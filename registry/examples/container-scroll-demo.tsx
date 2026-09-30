"use client";
import * as React from "react";
import { ContainerScroll } from "@/components/ballmac/container-scroll";
export default function ContainerScrollDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} role="region" tabIndex={0} aria-label="Product showcase" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-[26rem] w-full max-w-3xl overflow-auto rounded-xl border bg-background shadow-sm">
      <div className="h-16" aria-hidden="true" />
      <ContainerScroll
        container={scroller}
        title={
          <>
            <p className="text-sm font-medium text-primary">Dashboard</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">Everything in one calm view</h2>
          </>
        }
      >
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {[["Revenue", "$48.2k"], ["Active users", "2,910"], ["Conversion", "4.6%"]].map(([k, v]) => (
            <div key={k} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="text-2xl font-semibold tabular-nums">{v}</p>
            </div>
          ))}
          <div className="col-span-full flex h-28 items-end gap-2 rounded-xl border bg-card p-4">
            {[35, 55, 42, 70, 62, 88, 76, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </ContainerScroll>
      <div className="h-40" aria-hidden="true" />
    </div>
  );
}
