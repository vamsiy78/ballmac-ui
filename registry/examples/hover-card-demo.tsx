import { ArrowUpRight, FolderKanban } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ballmac/hover-card";
export default function HoverCardDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Pinned project
      </p>
      <div className="mt-3 flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderKanban aria-hidden="true" className="size-5" />
        </span>
        <div>
          <HoverCard defaultOpen openDelay={150}>
            <HoverCardTrigger
              href="#project"
              className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Atlas launch{" "}
              <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-sm font-semibold">Atlas launch</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                A shared space for the upcoming product release, from draft
                assets to the final checklist.
              </p>
              <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-1">
                  8 teammates
                </span>
                <span className="rounded-full bg-muted px-2 py-1">
                  24 files
                </span>
              </div>
            </HoverCardContent>
          </HoverCard>
          <p className="mt-1 text-xs text-muted-foreground">
            Hover or focus for a quick preview
          </p>
        </div>
      </div>
    </div>
  );
}
