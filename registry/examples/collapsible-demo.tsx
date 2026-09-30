import { BadgeCheck, GitCommitHorizontal } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ballmac/collapsible";
export default function CollapsibleDemo() {
  return (
    <Collapsible
      defaultOpen
      className="w-full max-w-sm rounded-xl border bg-card p-2 shadow-sm"
    >
      <CollapsibleTrigger>
        <span className="flex items-center gap-2">
          <BadgeCheck aria-hidden="true" className="size-4 text-primary" />
          Release 2.4 is ready
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mx-3 mb-2 border-t pt-3 text-sm">
          <p className="mb-3 text-muted-foreground">
            Three updates are included in this release.
          </p>
          <ul className="grid gap-2">
            <li className="flex items-center gap-2">
              <GitCommitHorizontal
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />{" "}
              Faster project search
            </li>
            <li className="flex items-center gap-2">
              <GitCommitHorizontal
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />{" "}
              Share links for guests
            </li>
            <li className="flex items-center gap-2">
              <GitCommitHorizontal
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />{" "}
              Improved export flow
            </li>
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
