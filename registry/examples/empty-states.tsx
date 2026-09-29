import { Search } from "lucide-react"
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ballmac/empty"
export default function EmptyStates() {
  return (
    <Empty compact className="max-w-sm">
      <EmptyMedia>
        <Search />
      </EmptyMedia>
      <EmptyTitle>No results for “quarterly”</EmptyTitle>
      <EmptyDescription>
        Try a different term or clear your filters.
      </EmptyDescription>
    </Empty>
  )
}
