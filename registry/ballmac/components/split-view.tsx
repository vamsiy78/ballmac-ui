// Ballmac UI: Split View. https://ui.ballmac.com/components/split-view
"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type SplitViewContextValue = {
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
};
const SplitViewContext = React.createContext<SplitViewContextValue | null>(null);

/** Read or change whether the detail pane is showing on narrow screens. */
function useSplitView() {
  const context = React.useContext(SplitViewContext);
  if (!context) throw new Error("useSplitView must be used inside <SplitView>");
  return context;
}

type SplitViewProps = React.ComponentProps<"div"> & {
  /** Controlled: show the detail pane when the container is narrow. */
  detailOpen?: boolean;
  /** Initial state when uncontrolled. */
  defaultDetailOpen?: boolean;
  /** Called when the detail pane opens or closes on narrow screens. */
  onDetailOpenChange?: (open: boolean) => void;
  /** Initial width of the list pane in pixels when both panes show. */
  listWidth?: number;
  /** Smallest width the list pane can be dragged to. */
  minListWidth?: number;
  /** Largest width the list pane can be dragged to. */
  maxListWidth?: number;
};

/**
 * A master and detail layout (mail, files, settings). Both panes show side by side when the container is wide;
 * below ~40rem it shows one at a time with a Back button. The divider resizes with the mouse, touch or arrow keys.
 */
function SplitView({
  detailOpen: detailOpenProp,
  defaultDetailOpen = false,
  onDetailOpenChange,
  listWidth = 300,
  minListWidth = 220,
  maxListWidth = 520,
  className,
  style,
  children,
  ...props
}: SplitViewProps) {
  const [inner, setInner] = React.useState(defaultDetailOpen);
  const detailOpen = detailOpenProp ?? inner;
  const setDetailOpen = React.useCallback(
    (open: boolean) => {
      if (detailOpenProp === undefined) setInner(open);
      onDetailOpenChange?.(open);
    },
    [detailOpenProp, onDetailOpenChange],
  );
  const [width, setWidth] = React.useState(listWidth);
  const clamp = React.useCallback((w: number) => Math.min(maxListWidth, Math.max(minListWidth, w)), [minListWidth, maxListWidth]);
  const value = React.useMemo(() => ({ detailOpen, setDetailOpen }), [detailOpen, setDetailOpen]);
  const drag = React.useRef<{ x: number; w: number } | null>(null);
  return (
    <SplitViewContext.Provider value={value}>
      <div
        data-slot="split-view"
        data-detail-open={detailOpen || undefined}
        className={cn("@container/split group/split h-full min-h-0 w-full overflow-hidden", className)}
        {...props}
      >
        <div
          style={{ "--split-list-w": `${width}px`, ...style } as React.CSSProperties}
          className="grid h-full min-h-0 w-full grid-cols-1 @2xl/split:grid-cols-[var(--split-list-w)_auto_minmax(0,1fr)]"
        >
          {children}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize list"
            aria-valuemin={minListWidth}
            aria-valuemax={maxListWidth}
            aria-valuenow={width}
            tabIndex={0}
            data-slot="split-view-divider"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { x: event.clientX, w: width };
            }}
            onPointerMove={(event) => {
              if (drag.current) setWidth(clamp(drag.current.w + event.clientX - drag.current.x));
            }}
            onPointerUp={() => (drag.current = null)}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 64 : 16;
              if (event.key === "ArrowLeft") setWidth((w) => clamp(w - step));
              else if (event.key === "ArrowRight") setWidth((w) => clamp(w + step));
              else if (event.key === "Home") setWidth(minListWidth);
              else if (event.key === "End") setWidth(maxListWidth);
              else return;
              event.preventDefault();
            }}
            className="group/divider relative col-start-2 row-start-1 hidden w-px cursor-col-resize touch-none bg-border outline-none transition-colors after:absolute after:inset-y-0 after:-inset-x-1.5 hover:bg-ring/60 focus-visible:bg-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 @2xl/split:block motion-reduce:transition-none"
          />
        </div>
      </div>
    </SplitViewContext.Provider>
  );
}

type SplitViewPaneProps = React.ComponentProps<"section"> & {
  /** Accessible name of the pane. */
  label?: string;
};

/** The list (master) pane. Hidden on narrow containers while the detail pane is open. */
function SplitViewList({ label = "List", className, ...props }: SplitViewPaneProps) {
  return (
    <section
      aria-label={label}
      data-slot="split-view-list"
      className={cn(
        "col-start-1 row-start-1 min-h-0 min-w-0 overflow-y-auto @max-2xl/split:group-data-[detail-open]/split:hidden",
        className,
      )}
      {...props}
    />
  );
}

/** The detail pane. Hidden on narrow containers until something is opened. */
function SplitViewDetail({ label = "Detail", className, ...props }: SplitViewPaneProps) {
  return (
    <section
      aria-label={label}
      data-slot="split-view-detail"
      className={cn(
        "col-start-1 row-start-1 hidden min-h-0 min-w-0 overflow-y-auto group-data-[detail-open]/split:block @2xl/split:col-start-3 @2xl/split:block",
        className,
      )}
      {...props}
    />
  );
}

type SplitViewBackProps = React.ComponentProps<"button">;
/** Returns to the list on narrow containers. Not rendered visibly when both panes are showing. */
function SplitViewBack({ className, children = "Back", onClick, ...props }: SplitViewBackProps) {
  const { setDetailOpen } = useSplitView();
  return (
    <button
      type="button"
      data-slot="split-view-back"
      onClick={(event) => {
        onClick?.(event);
        setDetailOpen(false);
      }}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 @2xl/split:hidden",
        className,
      )}
      {...props}
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {children}
    </button>
  );
}

export {
  SplitView,
  SplitViewList,
  SplitViewDetail,
  SplitViewBack,
  useSplitView,
  type SplitViewProps,
  type SplitViewPaneProps,
  type SplitViewBackProps,
};
