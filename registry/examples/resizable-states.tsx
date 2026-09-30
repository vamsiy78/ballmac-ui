"use client";
import * as React from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { Button } from "@/components/ballmac/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ballmac/resizable";
export default function ResizableStates() {
  const panel = React.useRef<ImperativePanelHandle>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        aria-pressed={collapsed}
        onClick={() => (collapsed ? panel.current?.expand() : panel.current?.collapse())}
      >
        {collapsed ? "Show inbox" : "Hide inbox"}
      </Button>
      <ResizablePanelGroup direction="horizontal" className="h-40 overflow-hidden rounded-xl border bg-card">
        <ResizablePanel ref={panel} defaultSize={35} minSize={20} collapsible collapsedSize={0} onCollapse={() => setCollapsed(true)} onExpand={() => setCollapsed(false)}>
          <div className="h-full p-3 text-sm">
            <p className="font-medium">Inbox</p>
            <p className="text-muted-foreground">12 unread</p>
          </div>
        </ResizablePanel>
        <ResizableHandle label="Resize inbox" withHandle />
        <ResizablePanel defaultSize={65}>
          <div className="h-full p-3 text-sm text-muted-foreground">Drag the handle, or focus it and use the arrow keys. Drag past the minimum to collapse.</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
