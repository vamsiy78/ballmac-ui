"use client"

import { ArrowRight, Bell, Check, CircleAlert, Search, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Alert, AlertDescription, AlertTitle } from "@/components/ballmac/alert"
import { Avatar, AvatarFallback } from "@/components/ballmac/avatar"
import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ballmac/card"
import { ChartContainer, type ChartConfig } from "@/components/ballmac/chart"
import { Checkbox } from "@/components/ballmac/checkbox"
import { Input } from "@/components/ballmac/input"
import { Label } from "@/components/ballmac/label"
import { Progress } from "@/components/ballmac/progress"
import { Slider } from "@/components/ballmac/slider"
import { Switch } from "@/components/ballmac/switch"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { cn } from "@/lib/utils"

import { themeStyle, type Mode } from "./theme-style"
import type { ThemeSpec } from "@ballmac-ui/theme-engine"

const data = [
  { month: "Jan", new: 42, expansion: 18, churn: 8 },
  { month: "Feb", new: 51, expansion: 22, churn: 9 },
  { month: "Mar", new: 47, expansion: 27, churn: 7 },
  { month: "Apr", new: 62, expansion: 31, churn: 10 },
  { month: "May", new: 70, expansion: 35, churn: 8 },
  { month: "Jun", new: 78, expansion: 42, churn: 9 },
]
const config = {
  new: { label: "New", color: "var(--chart-1)" },
  expansion: { label: "Expansion", color: "var(--chart-2)" },
  churn: { label: "Churn", color: "var(--chart-3)" },
} satisfies ChartConfig

const roles = [
  { n: 1, name: "Brand" },
  { n: 2, name: "Growth" },
  { n: 3, name: "Alert" },
  { n: 4, name: "Neutral" },
  { n: 5, name: "Extra" },
]

/** A small real app built from Ballmac components, themed by inline variables. Nothing here portals out of the stage. */
export function ThemeStage({ spec, mode, className, id }: { spec: ThemeSpec; mode: Mode; className?: string; id: string }) {
  return (
    <div data-theme-scope={mode} className={cn(mode === "dark" && "dark", "@container", className)} style={themeStyle(spec, mode)}>
      <div className="bg-background text-foreground">
        <div className="flex items-center gap-3 border-b px-4 py-3 @xl:px-6">
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-lg text-sm font-semibold" aria-hidden="true">
            N
          </span>
          <span className="font-semibold tracking-tight">Northwind</span>
          <nav aria-label="Preview navigation" className="text-muted-foreground ml-3 hidden items-center gap-1 text-sm @lg:flex">
            <span className="text-foreground bg-accent rounded-md px-2.5 py-1 font-medium">Overview</span>
            <span className="px-2.5 py-1">Customers</span>
            <span className="px-2.5 py-1">Billing</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden @md:block">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" aria-hidden="true" />
              <Input aria-label="Search the preview" placeholder="Search" size="sm" className="w-44 pl-8" />
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Notifications (preview)">
              <Bell />
            </Button>
            <Avatar size="sm">
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="grid gap-4 p-4 @xl:p-6 @3xl:grid-cols-3">
          <Card className="@3xl:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Net new revenue</CardTitle>
                  <CardDescription>Monthly recurring revenue, by source</CardDescription>
                </div>
                <SegmentedControl aria-label="Range" defaultValue="6m">
                  <SegmentedControlItem value="30d">30d</SegmentedControlItem>
                  <SegmentedControlItem value="6m">6m</SegmentedControlItem>
                  <SegmentedControlItem value="1y">1y</SegmentedControlItem>
                </SegmentedControl>
              </div>
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-semibold tracking-tight tabular-nums">$128,400</span>
                <Badge variant="outline" className="gap-1">
                  <TrendingUp aria-hidden="true" /> 12.4%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={config} label="Monthly revenue by source, January to June" summary="New revenue grows from 42 in January to 78 in June; expansion from 18 to 42." className="aspect-[16/7] w-full">
                <BarChart data={data} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <Bar dataKey="new" fill="var(--color-new)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="expansion" fill="var(--color-expansion)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="churn" fill="var(--color-churn)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan usage</CardTitle>
              <CardDescription>72% of your seats are in use</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Progress value={72} aria-label="Seats in use" />
              <div className="flex flex-wrap gap-2">
                <Badge>Pro</Badge>
                <Badge variant="secondary">Annual</Badge>
                <Badge variant="outline">18 seats</Badge>
                <Badge variant="destructive">Overdue</Badge>
              </div>
              <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
                {roles.map((r) => (
                  <span key={r.n} className="h-8 rounded-md" style={{ background: `var(--chart-${r.n})` }} />
                ))}
              </div>
              <p className="text-muted-foreground text-xs">The five chart colours, in order.</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="flex-1">
                Upgrade <ArrowRight />
              </Button>
              <Button variant="outline">Manage</Button>
            </CardFooter>
          </Card>

          <Card className="@3xl:col-span-1">
            <CardHeader>
              <CardTitle>New project</CardTitle>
              <CardDescription>Fields, switches and sliders</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`${id}-name`}>Name</Label>
                <Input id={`${id}-name`} defaultValue="Spring launch" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${id}-email`}>Owner email</Label>
                <Input id={`${id}-email`} defaultValue="maya@" aria-invalid="true" aria-describedby={`${id}-email-error`} />
                <p id={`${id}-email-error`} className="text-destructive text-xs">
                  Enter a full email address.
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`${id}-notify`}>Notify the team</Label>
                <Switch id={`${id}-notify`} defaultChecked />
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox id={`${id}-terms`} defaultChecked />
                <Label htmlFor={`${id}-terms`}>Share with guests</Label>
              </div>
              <Slider defaultValue={[60]} aria-label="Budget" />
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>
                <Check /> Create
              </Button>
            </CardFooter>
          </Card>

          <div className="grid content-start gap-4 @3xl:col-span-2">
            <Alert variant="success">
              <Check aria-hidden="true" />
              <AlertTitle>Invoice sent</AlertTitle>
              <AlertDescription>Northwind will email the receipt to maya@northwind.example today.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription>The card ending 4242 was declined. Update it to keep your plan active.</AlertDescription>
            </Alert>
            <Card>
              <CardContent className="grid gap-3 pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Delete</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight">The quick brown fox jumps over the lazy dog</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">Body text in the muted colour: contrast is measured for this pairing, on the page and on muted surfaces.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
