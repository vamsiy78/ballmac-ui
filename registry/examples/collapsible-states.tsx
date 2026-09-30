"use client";
import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ballmac/collapsible";
export default function CollapsibleStates() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="w-full max-w-xs">
      <p className="mb-2 text-xs text-muted-foreground">
        Controlled state: {open ? "open" : "closed"}
      </p>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="rounded-xl border p-2"
      >
        <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
        <CollapsibleContent>
          <p className="px-3 pb-3 text-sm text-muted-foreground">
            Only admins can change project defaults.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
