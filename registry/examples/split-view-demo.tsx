"use client";
import * as React from "react";
import { Inbox, Star } from "lucide-react";
import { SplitView, SplitViewBack, SplitViewDetail, SplitViewList, useSplitView } from "@/components/ballmac/split-view";
const messages = [
  { id: "1", from: "Ana Lima", subject: "Launch checklist", time: "9:41", body: "Here is the final checklist for Friday. Copy is approved and the screenshots are attached. Can you confirm the rollout window?" },
  { id: "2", from: "Kofi Mensah", subject: "Invoice INV-2044", time: "8:15", body: "Attached is the invoice for September. Let me know if anything needs correcting before it goes out." },
  { id: "3", from: "Mei Tanaka", subject: "Design review notes", time: "Yesterday", body: "Thanks for the walkthrough. Two small notes on spacing in the pricing table, otherwise we are good." },
  { id: "4", from: "Sam Okafor", subject: "Team offsite", time: "Mon", body: "Voting is open for the offsite dates. Please pick the days that work for you by Wednesday." },
];
function List({ selected, onPick }: { selected: string; onPick: (id: string) => void }) {
  const { setDetailOpen } = useSplitView();
  return (
    <ul className="divide-y">
      {messages.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            aria-current={selected === m.id ? "true" : undefined}
            onClick={() => {
              onPick(m.id);
              setDetailOpen(true);
            }}
            className="grid w-full gap-0.5 px-4 py-3 text-left outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent aria-[current=true]:bg-accent"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-semibold">{m.from}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{m.time}</span>
            </span>
            <span className="truncate text-sm">{m.subject}</span>
            <span className="line-clamp-1 text-xs text-muted-foreground">{m.body}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
export default function SplitViewDemo() {
  const [selected, setSelected] = React.useState("1");
  const message = messages.find((m) => m.id === selected)!;
  return (
    <div className="h-80 w-full max-w-3xl overflow-hidden rounded-xl border bg-card shadow-sm">
      <SplitView>
        <SplitViewList label="Messages">
          <div className="flex h-11 items-center gap-2 border-b px-4 text-sm font-semibold">
            <Inbox aria-hidden="true" className="size-4" /> Inbox
          </div>
          <List selected={selected} onPick={setSelected} />
        </SplitViewList>
        <SplitViewDetail label="Message">
          <div className="flex h-11 items-center gap-2 border-b px-3">
            <SplitViewBack>Inbox</SplitViewBack>
            <span className="ml-auto text-muted-foreground"><Star aria-hidden="true" className="size-4" /></span>
          </div>
          <article className="grid gap-2 p-5">
            <h3 className="text-lg font-semibold tracking-tight">{message.subject}</h3>
            <p className="text-xs text-muted-foreground">From {message.from} · {message.time}</p>
            <p className="mt-2 text-sm leading-relaxed">{message.body}</p>
          </article>
        </SplitViewDetail>
      </SplitView>
    </div>
  );
}
