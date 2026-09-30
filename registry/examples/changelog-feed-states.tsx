import { Sparkles } from "lucide-react";
import { ChangelogFeed } from "@/components/ballmac/changelog-feed";
export default function ChangelogFeedStates() {
  return (
    <ChangelogFeed
      filterable={false}
      className="max-w-2xl"
      entries={[
        {
          id: "1",
          version: "1.0.0",
          date: "2026-07-01",
          title: "Hello, world",
          summary: "The first public release.",
          media: (
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-chart-1/20 via-chart-4/15 to-chart-2/20">
              <Sparkles aria-hidden="true" className="size-8 text-foreground/60" />
            </div>
          ),
          changes: [{ type: "new", text: "Projects, tasks and comments." }],
        },
      ]}
    />
  );
}
