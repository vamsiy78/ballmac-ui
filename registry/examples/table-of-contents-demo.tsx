"use client";
import * as React from "react";
import { TableOfContents } from "@/components/ballmac/table-of-contents";
const sections = [
  ["Overview", ["What this covers", "Who it is for"]],
  ["Installation", ["Requirements", "Add the package"]],
  ["Usage", ["Basic example", "Options"]],
  ["Accessibility", []],
] as const;
export default function TableOfContentsDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div className="grid w-full max-w-2xl gap-6 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-[1fr_12rem]">
      <div ref={scroller} tabIndex={0} aria-label="Guide" className="h-72 overflow-auto pr-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <article className="grid gap-3 text-sm leading-relaxed text-muted-foreground">
          {sections.map(([title, subs]) => (
            <section key={title} className="grid gap-3">
              <h2 className="pt-2 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
              <p>Short introduction to {title.toLowerCase()}. Enough text that the section has real height and scrolling feels natural.</p>
              {subs.map((s) => (
                <React.Fragment key={s}>
                  <h3 className="pt-1 text-base font-medium text-foreground">{s}</h3>
                  <p>Details about {s.toLowerCase()}, written as plain paragraphs for the demo.</p>
                </React.Fragment>
              ))}
              <p className="pb-10">More detail follows here so the next heading is not in view yet.</p>
            </section>
          ))}
        </article>
      </div>
      <TableOfContents headingsFrom={scroller} container={scroller} offset={12} className="max-sm:hidden" />
    </div>
  );
}
