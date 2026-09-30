"use client";
import * as React from "react";
import { AlignJustify, Grid2X2, Rows3 } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ballmac/toggle-group";
export default function ToggleGroupDemo() {
  const [view, setView] = React.useState("cards");
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold">Project view</p>
          <p className="text-xs text-muted-foreground">
            Pick your preferred layout
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => value && setView(value)}
          aria-label="Project view"
          size="sm"
        >
          <ToggleGroupItem value="cards" aria-label="Cards">
            <Grid2X2 aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="rows" aria-label="Rows">
            <Rows3 aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="compact" aria-label="Compact">
            <AlignJustify aria-hidden="true" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
        {view === "cards"
          ? "Projects shown as cards"
          : view === "rows"
            ? "Projects shown as rows"
            : "Compact list enabled"}
      </div>
    </div>
  );
}
