import { ArrowUpRight } from "lucide-react"

import { Badge, badgeVariants } from "@/components/ballmac/badge"

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
      <a href="#changelog" className={badgeVariants({ variant: "outline" })}>
        Changelog <ArrowUpRight aria-hidden="true"  className="rtl:-scale-x-100"/>
      </a>
    </div>
  )
}
