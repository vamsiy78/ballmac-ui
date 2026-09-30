"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ballmac/chart";
const data = [
  { month: "Apr", revenue: 18200, refunds: 1200 },
  { month: "May", revenue: 21400, refunds: 1500 },
  { month: "Jun", revenue: 19800, refunds: 900 },
  { month: "Jul", revenue: 26300, refunds: 1800 },
  { month: "Aug", revenue: 29100, refunds: 1400 },
  { month: "Sep", revenue: 34600, refunds: 2100 },
];
const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  refunds: { label: "Refunds", color: "var(--chart-3)" },
} satisfies ChartConfig;
export default function ChartDemo() {
  return (
    <div className="w-full max-w-lg rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold">Revenue</p>
        <p className="text-xs text-muted-foreground">April to September</p>
      </div>
      <ChartContainer
        config={config}
        label="Monthly revenue and refunds, April to September"
        summary="Revenue grew from $18,200 in April to $34,600 in September. Refunds stayed between $900 and $2,100."
        className="aspect-[16/9] w-full"
      >
        <AreaChart data={data} margin={{ left: 0, right: 16, top: 8 }} accessibilityLayer>
          <defs>
            <linearGradient id="fill-revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fill-refunds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-refunds)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-refunds)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 4, right: 12 }} />
          <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `$${v / 1000}k`} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Area dataKey="revenue" type="monotone" fill="url(#fill-revenue)" stroke="var(--color-revenue)" strokeWidth={2} />
          <Area dataKey="refunds" type="monotone" fill="url(#fill-refunds)" stroke="var(--color-refunds)" strokeWidth={2} />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
