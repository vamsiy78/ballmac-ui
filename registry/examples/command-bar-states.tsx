"use client";
import * as React from "react";
import { Search } from "lucide-react";
import { buttonVariants } from "@/components/ballmac/button";
import { CommandBar } from "@/components/ballmac/command-bar";
export default function CommandBarStates() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center gap-3">
      <button type="button" className={buttonVariants({ variant: "outline" })} onClick={() => setOpen(true)}>
        <Search aria-hidden="true" /> Open from your own button
      </button>
      <CommandBar
        trigger={false}
        hotkey="j"
        title="Jump to"
        placeholder="Jump to…"
        open={open}
        onOpenChange={setOpen}
        groups={[{ heading: "Recent", items: [{ id: "a", label: "Launch plan" }, { id: "b", label: "Pricing model" }, { id: "c", label: "Brand guidelines" }] }]}
      />
    </div>
  );
}
