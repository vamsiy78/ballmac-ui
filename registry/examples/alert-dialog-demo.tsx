"use client";
import * as React from "react";
import { Trash2, FolderClosed } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ballmac/alert-dialog";
export default function AlertDialogDemo() {
  const [removed, setRemoved] = React.useState(false);
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <FolderClosed aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Launch workspace</p>
          <p className="text-xs text-muted-foreground">
            12 files · updated today
          </p>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={removed}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          {removed ? "Project removed" : "Remove project"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove Launch workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the project and its 12 files for everyone on your
              team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep project</AlertDialogCancel>
            <AlertDialogAction destructive onClick={() => setRemoved(true)}>
              Remove project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
