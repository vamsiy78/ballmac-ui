"use client";
import * as React from "react";
import { Pin } from "lucide-react";
import { Toggle } from "@/components/ballmac/toggle";
export default function ToggleDemo() {
  const [pinned, setPinned] = React.useState(true);
  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Atlas launch</p>
        <p className="text-xs text-muted-foreground">
          {pinned ? "Pinned to your sidebar" : "Not pinned"}
        </p>
      </div>
      <Toggle
        variant="outline"
        pressed={pinned}
        onPressedChange={setPinned}
        aria-label={pinned ? "Unpin Atlas launch" : "Pin Atlas launch"}
      >
        <Pin aria-hidden="true" />
        {pinned ? "Pinned" : "Pin"}
      </Toggle>
    </div>
  );
}
