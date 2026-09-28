import { ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>New</Badge>
      <Badge variant="secondary">v2.4.0</Badge>
      <Badge variant="outline">Pro plan</Badge>
      <Badge variant="destructive">Overdue</Badge>
      <Badge variant="outline" dot>
        Draft
      </Badge>
      <Badge variant="outline" asChild>
        <a href="#changelog">
          Changelog <ArrowUpRight aria-hidden="true" />
        </a>
      </Badge>
    </div>
  )
}
