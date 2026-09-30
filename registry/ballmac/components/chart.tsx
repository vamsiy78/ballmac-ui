// Ballmac UI: Chart. https://ui.ballmac.com/components/chart
// Based on shadcn/ui Chart (MIT, Copyright (c) 2023 shadcn) on Recharts (MIT, Copyright (c) 2015-present Recharts Group), adding a named figure with a screen-reader summary, keyboard navigation by default, theme-token series colors, and a tooltip with indicator styles.
"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

type ChartConfig = {
  [key: string]: {
    /** Name shown in the tooltip and legend. */
    label?: React.ReactNode;
    /** Icon shown before the label in the legend and tooltip. */
    icon?: React.ComponentType;
  } & (
    | { /** A CSS color or token, for example `var(--chart-1)`. */ color?: string; theme?: never }
    | { color?: never; /** Separate colors per theme. */ theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

type ChartContainerProps = React.ComponentProps<"figure"> & {
  /** Series definitions keyed by the chart's `dataKey`. Each becomes a `--color-<key>` CSS variable. */
  config: ChartConfig;
  /** One Recharts chart (AreaChart, BarChart, LineChart, PieChart, RadarChart…). */
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  /** Accessible name of the figure. */
  label: string;
  /** Plain-language summary of what the chart shows, read by screen readers. */
  summary?: string;
  /** Size used before the container is measured, so the server render has a stable box. */
  initialDimension?: { width: number; height: number };
};

/** Wraps a Recharts chart: sizes it responsively, exposes series colors as CSS variables and names it for assistive tech. */
function ChartContainer({
  id,
  className,
  children,
  config,
  label,
  summary,
  initialDimension = { width: 480, height: 270 },
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
  const summaryId = `${chartId}-summary`;
  return (
    <ChartContext.Provider value={{ config }}>
      <figure
        data-slot="chart"
        data-chart={chartId}
        aria-label={label}
        aria-describedby={summary ? summaryId : undefined}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke$='ccc']]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke$='fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke$='ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/60 [&_.recharts-reference-line_[stroke$='ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke$='fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        {summary && (
          <figcaption id={summaryId} className="sr-only">
            {summary}
          </figcaption>
        )}
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </figure>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color);
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color = item.theme?.[theme as keyof typeof item.theme] || item.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type PayloadItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string | Array<number | string>;
  color?: string;
  fill?: string;
  stroke?: string;
  type?: string;
  payload?: Record<string, unknown> & { fill?: string };
};

function getItemConfig(config: ChartConfig, item: PayloadItem, key: string) {
  const payload = item.payload;
  const candidates = [
    key,
    typeof item.dataKey === "string" ? item.dataKey : undefined,
    typeof item.name === "string" ? item.name : undefined,
    payload && typeof payload[key] === "string" ? (payload[key] as string) : undefined,
  ];
  for (const c of candidates) if (c && c in config) return config[c];
  return undefined;
}

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: PayloadItem[];
  label?: React.ReactNode;
  className?: string;
  /** Marker style before each value. */
  indicator?: "dot" | "line" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  /** Key in the data point whose value is used as the tooltip title. */
  labelKey?: string;
  /** Key used to look up the series name and color in `config`. */
  nameKey?: string;
  labelFormatter?: (label: React.ReactNode, payload: PayloadItem[]) => React.ReactNode;
  formatter?: (value: number | string, name: string, item: PayloadItem, index: number) => React.ReactNode;
  labelClassName?: string;
  color?: string;
};

/** The tooltip card. Pass it as `<ChartTooltip content={<ChartTooltipContent />} />`. */
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;
    const [item] = payload;
    const key = `${labelKey ?? item.dataKey ?? item.name ?? "value"}`;
    const itemConfig = getItemConfig(config, item, key);
    const value = !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label;
    if (labelFormatter) return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>;
    return value ? <div className={cn("font-medium", labelClassName)}>{value}</div> : null;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
  if (!active || !payload?.length) return null;
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return (
    <div
      className={cn(
        "grid min-w-36 items-start gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.25)]",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
            const itemConfig = getItemConfig(config, item, key);
            const indicatorColor = color ?? item.payload?.fill ?? item.color;
            const Icon = itemConfig?.icon;
            return (
              <div
                key={`${item.dataKey ?? index}`}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item.value !== undefined && item.name ? (
                  formatter(item.value as number | string, String(item.name), item, index)
                ) : (
                  <>
                    {Icon ? (
                      <Icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={{ "--color-bg": indicatorColor, "--color-border": indicatorColor } as React.CSSProperties}
                        />
                      )
                    )}
                    <div className={cn("flex flex-1 justify-between gap-4 leading-none", nestLabel ? "items-end" : "items-center")}>
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
                      </div>
                      {item.value !== undefined && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === "number" ? item.value.toLocaleString("en-US") : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

type ChartLegendContentProps = React.ComponentProps<"div"> & {
  payload?: Array<{ value?: string | number; dataKey?: string | number; color?: string; type?: string }>;
  verticalAlign?: "top" | "middle" | "bottom";
  hideIcon?: boolean;
  /** Key used to look up the series in `config`. */
  nameKey?: string;
};

/** The legend row. Pass it as `<ChartLegend content={<ChartLegendContent />} />`. */
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();
  if (!payload?.length) return null;
  return (
    <ul
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey ?? item.dataKey ?? item.value ?? "value"}`;
          const itemConfig = getItemConfig(config, item as PayloadItem, key);
          const Icon = itemConfig?.icon;
          return (
            <li
              key={String(item.value)}
              className="flex items-center gap-1.5 text-muted-foreground [&>svg]:h-3 [&>svg]:w-3"
            >
              {Icon && !hideIcon ? (
                <Icon />
              ) : (
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
              )}
              {itemConfig?.label ?? item.value}
            </li>
          );
        })}
    </ul>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
  type ChartConfig,
  type ChartContainerProps,
  type ChartTooltipContentProps,
  type ChartLegendContentProps,
};
