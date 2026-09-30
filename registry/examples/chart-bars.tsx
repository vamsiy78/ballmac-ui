"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ballmac/chart";
const data = [
  { day: "Mon", web: 186, mobile: 80 },
  { day: "Tue", web: 305, mobile: 200 },
  { day: "Wed", web: 237, mobile: 120 },
  { day: "Thu", web: 273, mobile: 190 },
  { day: "Fri", web: 209, mobile: 130 },
];
const config = {
  web: { label: "Web", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;
export default function ChartBars() {
  return (
    <ChartContainer
      config={config}
      label="Sessions by platform, Monday to Friday"
      summary="Web sessions peak on Tuesday at 305. Mobile peaks the same day at 200."
      className="aspect-[16/9] w-full max-w-md"
    >
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="web" fill="var(--color-web)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
