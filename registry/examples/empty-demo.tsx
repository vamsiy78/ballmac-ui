import { Inbox } from "lucide-react"
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyAction,
} from "@/components/ballmac/empty"
import { buttonVariants } from "@/components/ballmac/button"
export default function EmptyDemo() {
  return (
    <Empty className="max-w-md">
      <EmptyMedia>
        <Inbox />
      </EmptyMedia>
      <EmptyTitle>All caught up</EmptyTitle>
      <EmptyDescription>
        New requests will appear here. Invite a teammate to start collaborating.
      </EmptyDescription>
      <EmptyAction>
        <a href="#invite" className={buttonVariants({ size: "sm" })}>
          Invite teammate
        </a>
      </EmptyAction>
    </Empty>
  )
}
