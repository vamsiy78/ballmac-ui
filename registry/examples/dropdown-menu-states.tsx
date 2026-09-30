"use client";
import * as React from "react";
import { ArrowDownAZ, Clock, LayoutGrid, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ballmac/dropdown-menu";
export default function DropdownMenuStates() {
  const [sort, setSort] = React.useState("modified");
  const [view, setView] = React.useState("grid");
  return (
    <div className="flex w-full max-w-sm flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ArrowDownAZ aria-hidden="true" className="size-4" /> Sort and view
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="modified">
              <Clock aria-hidden="true" /> Last modified
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Layout</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={view} onValueChange={setView}>
            <DropdownMenuRadioItem value="grid">
              <LayoutGrid aria-hidden="true" /> Grid
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="list">
              <List aria-hidden="true" /> List
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {sort === "name" ? "By name" : "By last modified"}, {view}
      </p>
    </div>
  );
}
