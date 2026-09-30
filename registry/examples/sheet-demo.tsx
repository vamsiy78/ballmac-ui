"use client";
import * as React from "react";
import { buttonVariants } from "@/components/ballmac/button";
import { Input } from "@/components/ballmac/input";
import { Label } from "@/components/ballmac/label";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ballmac/sheet";
export default function SheetDemo() {
  const [name, setName] = React.useState("Acme launch");
  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">Project settings</p>
      </div>
      <Sheet>
        <SheetTrigger className={buttonVariants({ variant: "outline" })}>
          Edit project
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit project</SheetTitle>
            <SheetDescription>
              Rename the project and choose who is notified. Save when you are
              done.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="grid gap-2">
              <Label htmlFor="sheet-project-name">Project name</Label>
              <Input
                id="sheet-project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose className={buttonVariants({ variant: "outline" })}>
              Cancel
            </SheetClose>
            <SheetClose className={buttonVariants()}>Save changes</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
