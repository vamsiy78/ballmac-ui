"use client";
import { SplitView, SplitViewBack, SplitViewDetail, SplitViewList, useSplitView } from "@/components/ballmac/split-view";
const files = ["Brand guidelines.pdf", "Launch checklist.md", "Pricing model.xlsx"];
function Files() {
  const { setDetailOpen } = useSplitView();
  return (
    <ul className="divide-y">
      {files.map((f) => (
        <li key={f}>
          <button type="button" onClick={() => setDetailOpen(true)} className="w-full px-4 py-3 text-left text-sm outline-none hover:bg-accent/60 focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50">
            {f}
          </button>
        </li>
      ))}
    </ul>
  );
}
export default function SplitViewStates() {
  return (
    <div className="h-56 w-full max-w-xs overflow-hidden rounded-xl border bg-card">
      <SplitView>
        <SplitViewList label="Files">
          <Files />
        </SplitViewList>
        <SplitViewDetail label="File details">
          <div className="p-3">
            <SplitViewBack>Files</SplitViewBack>
            <p className="mt-3 px-2 text-sm text-muted-foreground">In a narrow container the panes stack: choose a file, then go back.</p>
          </div>
        </SplitViewDetail>
      </SplitView>
    </div>
  );
}
