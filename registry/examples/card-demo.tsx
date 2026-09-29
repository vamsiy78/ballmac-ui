import { ArrowUpRight, TrendingUp } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ballmac/card"
import { Badge } from "@/components/ballmac/badge"
export default function CardDemo() {
  return (
    <Card interactive className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Monthly overview</CardTitle>
        <CardDescription>Activity across your workspace</CardDescription>
        <CardAction>
          <TrendingUp aria-hidden="true" className="size-5 text-chart-2" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tabular-nums">12,840</div>
        <div className="mt-2 flex items-center gap-2">
          <Badge status="success">+12.8%</Badge>
          <span className="text-xs text-muted-foreground">from last month</span>
        </div>
      </CardContent>
      <CardFooter>
        <a
          href="#analytics"
          className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          View analytics <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </CardFooter>
    </Card>
  )
}
