"use client";
import * as React from "react";
import { Link2, LockKeyhole } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ballmac/popover";
export default function PopoverDemo() {
  const [access, setAccess] = React.useState("Team only");
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <LockKeyhole aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Project access</p>
          <p className="text-xs text-muted-foreground">{access}</p>
        </div>
        <Popover defaultOpen>
          <PopoverTrigger className="h-9 rounded-md border px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
            Manage
          </PopoverTrigger>
          <PopoverContent label="Share settings" align="end" showCloseButton>
            <PopoverHeader>
              <PopoverTitle>Share settings</PopoverTitle>
              <PopoverDescription>
                Choose who can open this project.
              </PopoverDescription>
            </PopoverHeader>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => setAccess("Team only")}
                className="flex h-9 items-center gap-2 rounded-md px-2 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <LockKeyhole aria-hidden="true" className="size-4" /> Team only{" "}
                {access === "Team only" && (
                  <span className="ml-auto text-xs text-primary">Selected</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAccess("Anyone with link")}
                className="flex h-9 items-center gap-2 rounded-md px-2 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <Link2 aria-hidden="true" className="size-4" /> Anyone with link{" "}
                {access === "Anyone with link" && (
                  <span className="ml-auto text-xs text-primary">Selected</span>
                )}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
