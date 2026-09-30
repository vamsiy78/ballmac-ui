// Ballmac UI: Resizable. https://ui.ballmac.com/components/resizable
// Based on shadcn/ui Resizable (MIT, Copyright (c) 2023 shadcn) on react-resizable-panels (MIT, Copyright (c) 2023 Brian Vaughn), adding a labelled separator, a larger hit area, a grip that appears on hover and focus, and a visible keyboard focus ring.
"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

type ResizablePanelGroupProps = React.ComponentProps<typeof PanelGroup>;
/** Container for panels and handles. `direction` is `"horizontal"` (side by side) or `"vertical"` (stacked). Pass `autoSaveId` to remember sizes. */
function ResizablePanelGroup({ className, ...props }: ResizablePanelGroupProps) {
  return (
    <PanelGroup
      data-slot="resizable-panel-group"
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  );
}

type ResizablePanelProps = React.ComponentProps<typeof Panel>;
/** A resizable region. Sizes are percentages: `defaultSize`, `minSize`, `maxSize`, and `collapsible` with `collapsedSize`. */
function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return <Panel data-slot="resizable-panel" className={cn("min-w-0", className)} {...props} />;
}

type ResizableHandleProps = React.ComponentProps<typeof PanelResizeHandle> & {
  /** Show a grip icon in the middle of the handle at all times (otherwise it appears on hover and focus). */
  withHandle?: boolean;
  /** Accessible name of the separator, for example "Resize sidebar". */
  label?: string;
};
/** The draggable divider. Focus it and use the arrow keys, Home and End to resize; Enter collapses a collapsible neighbor. */
function ResizableHandle({ withHandle = false, label = "Resize panels", className, ...props }: ResizableHandleProps) {
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      aria-label={label}
      className={cn(
        "group/handle relative flex w-px shrink-0 items-center justify-center bg-border outline-none transition-colors",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
        "hover:bg-ring/60 data-[resize-handle-state=drag]:bg-ring focus-visible:bg-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "data-[panel-group-direction=vertical]:after:inset-x-0 data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:h-3 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className={cn(
          "z-10 flex h-5 w-3.5 items-center justify-center rounded-sm border bg-background text-muted-foreground shadow-xs transition-opacity motion-reduce:transition-none",
          withHandle
            ? "opacity-100"
            : "opacity-0 group-hover/handle:opacity-100 group-focus-visible/handle:opacity-100 group-data-[resize-handle-state=drag]/handle:opacity-100",
        )}
      >
        <GripVertical className="size-3" />
      </div>
    </PanelResizeHandle>
  );
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  type ResizablePanelGroupProps,
  type ResizablePanelProps,
  type ResizableHandleProps,
};
