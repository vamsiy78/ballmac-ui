import { ActivityFeed } from "@/components/ballmac/activity-feed"
export default function ActivityFeedDemo() {
  return (
    <ActivityFeed
      className="w-full max-w-sm"
      items={[
        {
          id: "a",
          actor: "Alex",
          action: "approved",
          subject: "the design review",
          timestamp: "Just now",
          mark: "AL",
        },
        {
          id: "b",
          actor: "System",
          action: "published",
          subject: "the preview build",
          timestamp: "18 minutes ago",
          mark: "✓",
        },
        {
          id: "c",
          actor: "Sam",
          action: "updated",
          subject: "the release notes",
          timestamp: "Yesterday",
          mark: "SA",
        },
      ]}
    />
  )
}
