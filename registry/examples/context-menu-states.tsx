"use client";
import * as React from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ballmac/context-menu";
export default function ContextMenuStates() {
  const [grid, setGrid] = React.useState(true);
  const [zoom, setZoom] = React.useState("fit");
  return (
    <ContextMenu>
      <ContextMenuTrigger
        tabIndex={0}
        aria-label="Canvas. Right-click or press Shift+F10 for view options"
        className="grid h-40 w-full max-w-sm place-items-center rounded-xl border border-dashed bg-muted/40 text-sm text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {grid ? "Grid on" : "Grid off"} · zoom {zoom}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel>View</ContextMenuLabel>
        <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
          Show grid
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenuRadioItem value="fit">Fit to screen</ContextMenuRadioItem>
          <ContextMenuRadioItem value="100%">Actual size</ContextMenuRadioItem>
          <ContextMenuRadioItem value="200%" disabled>
            200% (unavailable)
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
