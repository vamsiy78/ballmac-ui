import { CheckCircle2, MessageSquare, UploadCloud } from "lucide-react";
import { ScrollArea } from "@/components/ballmac/scroll-area";
const entries = [
  {
    icon: UploadCloud,
    title: "New files uploaded",
    detail: "Design assets · 2 minutes ago",
  },
  {
    icon: MessageSquare,
    title: "Comment added",
    detail: "Q3 product brief · 18 minutes ago",
  },
  {
    icon: CheckCircle2,
    title: "Review completed",
    detail: "Release checklist · 1 hour ago",
  },
  {
    icon: UploadCloud,
    title: "Preview updated",
    detail: "Launch page · 3 hours ago",
  },
  {
    icon: MessageSquare,
    title: "Feedback received",
    detail: "Brand guide · Yesterday",
  },
];
export default function ScrollAreaDemo() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Recent activity</p>
        <p className="text-xs text-muted-foreground">
          Everything happening in your workspace
        </p>
      </div>
      <ScrollArea label="Recent workspace activity" className="h-52">
        <ul className="divide-y px-4">
          {entries.map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex items-start gap-3 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
