import { ActivityFeed } from "@/components/ballmac/activity-feed"
export default function ActivityFeedStates() {
  return (
    <ActivityFeed
      className="w-full max-w-sm"
      items={[]}
      emptyMessage="Changes to this workspace will appear here."
    />
  )
}
