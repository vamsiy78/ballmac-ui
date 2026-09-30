import { EmptyState } from "@/components/ballmac/empty-state"
export default function EmptyStateStates() {
  return (
    <EmptyState
      compact
      className="w-full max-w-sm"
      title="No results found"
      description="Try a different search term or remove a filter."
    />
  )
}
