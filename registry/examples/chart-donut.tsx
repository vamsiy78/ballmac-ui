"use client";
import { Cell, Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ballmac/chart";
const data = [
  { source: "search", visitors: 4210 },
  { source: "direct", visitors: 2890 },
  { source: "social", visitors: 1630 },
  { source: "email", visitors: 980 },
];
const config = {
  visitors: { label: "Visitors" },
  search: { label: "Search", color: "var(--chart-1)" },
  direct: { label: "Direct", color: "var(--chart-2)" },
  social: { label: "Social", color: "var(--chart-3)" },
  email: { label: "Email", color: "var(--chart-4)" },
} satisfies ChartConfig;
export default function ChartDonut() {
  const total = data.reduce((s, d) => s + d.visitors, 0);
  return (
    <ChartContainer
      config={config}
      label="Visitors by source"
      summary="Search brings the most visitors (4,210), followed by direct (2,890), social (1,630) and email (980)."
      className="aspect-square w-full max-w-xs"
    >
      <PieChart accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="source" />} />
        <Pie data={data} dataKey="visitors" nameKey="source" innerRadius="62%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
          {data.map((d) => (
            <Cell key={d.source} fill={`var(--color-${d.source})`} />
          ))}
          <Label
            position="center"
            content={({ viewBox }) =>
              viewBox && "cx" in viewBox ? (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground text-2xl font-semibold">
                    {total.toLocaleString("en-US")}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className="fill-muted-foreground text-xs">
                    visitors
                  </tspan>
                </text>
              ) : null
            }
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="source" />} />
      </PieChart>
    </ChartContainer>
  );
}
