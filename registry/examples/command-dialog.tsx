"use client";
import * as React from "react";
import { FilePlus, FolderOpen, Search } from "lucide-react";
import { buttonVariants } from "@/components/ballmac/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ballmac/command";
import { Kbd } from "@/components/ballmac/kbd";
export default function CommandDialogExample() {
  const [open, setOpen] = React.useState(false);
  const [last, setLast] = React.useState("Nothing run yet");
  const run = (name: string) => {
    setLast(name);
    setOpen(false);
  };
  return (
    <div className="grid w-full max-w-sm justify-items-start gap-3">
      <button type="button" onClick={() => setOpen(true)} className={buttonVariants({ variant: "outline" })}>
        <Search aria-hidden="true" /> Search commands <Kbd>⌘K</Kbd>
      </button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Last command: {last}
      </p>
      <CommandDialog open={open} onOpenChange={setOpen} title="Command menu">
        <CommandInput placeholder="Search files and actions…" />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => run("New file")}>
              <FilePlus aria-hidden="true" /> New file <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run("Open folder")}>
              <FolderOpen aria-hidden="true" /> Open folder <CommandShortcut>⌘O</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
