"use client";
import * as React from "react";
import { BarChart3, CheckCircle2, MessageSquare } from "lucide-react";
import { StickyScroll } from "@/components/ballmac/sticky-scroll";
function Panel({ icon: Icon, tone, children }: { icon: typeof BarChart3; tone: string; children: React.ReactNode }) {
  return (
    <div className={`flex h-full flex-col justify-between bg-gradient-to-br ${tone} via-card to-card p-6`}>
      <span className="flex size-12 items-center justify-center rounded-2xl border bg-background shadow-sm">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
function Bar({ w, label }: { w: string; label: string }) {
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-xs text-muted-foreground"><span>{label}</span><span className="tabular-nums">{w}</span></div>
      <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: w }} /></div>
    </div>
  );
}
const items = [
  {
    id: "plan",
    title: "Plan the work together",
    description: "Turn a goal into tasks, owners and dates. Everyone sees the same plan, and changes show up for the whole team as they happen.",
    visual: (
      <Panel icon={CheckCircle2} tone="from-chart-2/20">
        <Bar w="72%" label="Launch plan" />
        <Bar w="45%" label="Design review" />
        <Bar w="90%" label="Copy edit" />
      </Panel>
    ),
  },
  {
    id: "talk",
    title: "Talk where the work is",
    description: "Comment on a task, a file or a single line. Mentions notify the right person, and the conversation stays attached to the work.",
    visual: (
      <Panel icon={MessageSquare} tone="from-chart-1/20">
        <div className="w-4/5 rounded-2xl rounded-es-sm border bg-background p-3 text-sm shadow-sm">Can we move the review to Thursday?</div>
        <div className="ms-auto w-3/5 rounded-2xl rounded-ee-sm bg-primary p-3 text-sm text-primary-foreground shadow-sm">Done, invites updated.</div>
      </Panel>
    ),
  },
  {
    id: "measure",
    title: "Know how it went",
    description: "See what shipped, what slipped and where time went. Reports update on their own, so the review starts with facts.",
    visual: (
      <Panel icon={BarChart3} tone="from-chart-3/20">
        <div className="flex h-28 items-end gap-2">
          {[40, 65, 52, 80, 70, 95].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-primary/80" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Tasks completed, last six weeks</p>
      </Panel>
    ),
  },
];
export default function StickyScrollDemo() {
  const scroller = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={scroller} role="region" tabIndex={0} aria-label="Feature story" className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 h-[22rem] w-full max-w-4xl overflow-auto rounded-xl border bg-background p-6 shadow-sm sm:p-8">
      <StickyScroll items={items} container={scroller} stickyOffset={8} stepMinHeight="20rem" className="lg:gap-12" />
    </div>
  );
}
