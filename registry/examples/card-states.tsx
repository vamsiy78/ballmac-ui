import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ballmac/card"
export default function CardStates() {
  return (
    <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Active projects</CardTitle>
          <CardDescription>Across all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold tabular-nums">24</span>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Tasks due</CardTitle>
          <CardDescription>In the next seven days</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold tabular-nums">8</span>
        </CardContent>
      </Card>
    </div>
  )
}
