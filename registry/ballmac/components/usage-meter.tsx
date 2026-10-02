// Ballmac UI: Usage Meter. https://ui.ballmac.com/components/usage-meter
"use client";

import * as React from "react";
import { AlertTriangle, CircleCheck, OctagonAlert } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/ballmac/i18n";

type UsageSegment = {
  /** Name of this part of the total, for example "Images". */
  label: string;
  /** Amount used by this part. */
  value: number;
};

type UsageMeterProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** What is being measured, for example "Storage". */
  label: string;
  /** Amount used. Ignored when `segments` is given (then it is their sum). */
  used?: number;
  /** The plan limit. */
  limit: number;
  /** Unit shown after numbers, for example "GB" or "requests". */
  unit?: string;
  /** Break the total into parts, shown as a stacked bar and a legend. */
  segments?: UsageSegment[];
  /** Percent of the limit at which the meter turns to a warning. */
  warnAt?: number;
  /** Shape of the meter. */
  variant?: "bar" | "ring";
  /** Text under the numbers, for example "Resets on Oct 1". */
  note?: React.ReactNode;
  /** Content on the right of the header, such as an Upgrade button. */
  action?: React.ReactNode;
  /** Locale for number formatting. Fixed by default so server and browser match. */
  locale?: string;
};

const SEGMENT_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

/**
 * A plan-limit meter with three clear states: normal, near the limit, and over it. State is shown with an icon and words
 * as well as color. Exposes `role="meter"` with a readable value, and can split the total into labelled segments.
 */
function UsageMeter({
  label,
  used: usedProp,
  limit,
  unit,
  segments,
  warnAt = 80,
  variant = "bar",
  note,
  action,
  locale,
  className,
  ...props
}: UsageMeterProps) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const reduce = useReducedMotion();
  const labelId = React.useId();
  const used = segments ? segments.reduce((sum, s) => sum + s.value, 0) : (usedProp ?? 0);
  const percent = limit > 0 ? (used / limit) * 100 : 0;
  const state = percent >= 100 ? "over" : percent >= warnAt ? "warn" : "ok";
  const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const text = `${fmt.format(used)} of ${fmt.format(limit)}${unit ? ` ${unit}` : ""}`;
  const StateIcon = state === "over" ? OctagonAlert : state === "warn" ? AlertTriangle : CircleCheck;
  const stateText =
    state === "over" ? "Over limit" : state === "warn" ? `${Math.round(percent)}% used, nearing the limit` : `${Math.round(percent)}% used`;
  const iconTone = state === "over" ? "text-destructive" : state === "warn" ? "text-chart-3" : "text-chart-2";
  const fill = state === "over" ? "bg-destructive" : state === "warn" ? "bg-chart-3" : "bg-primary";
  const clamp = Math.min(100, Math.max(0, percent));

  const visual =
    variant === "ring" ? (
      <RingVisual percent={clamp} state={state} reduce={!!reduce} />
    ) : (
      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        {segments ? (
          <div className="flex h-full" style={{ width: `${clamp}%` }}>
            {segments.map((s, i) => (
              <motion.span
                key={s.label}
                className={cn("h-full first:rounded-s-full last:rounded-e-full", SEGMENT_COLORS[i % SEGMENT_COLORS.length])}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${used ? (s.value / used) * 100 : 0}%` }}
                transition={{ duration: 0.7, ease: ease.out, delay: reduce ? 0 : i * 0.06 }}
                style={{ marginInlineEnd: i < segments.length - 1 ? 1 : 0 }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className={cn("h-full rounded-full", fill)}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${clamp}%` }}
            transition={{ duration: 0.8, ease: ease.out }}
          />
        )}
        {/* the warning mark */}
        <span
          className="absolute inset-y-0 w-px bg-background/80"
          style={{ left: `${warnAt}%` }}
        />
      </div>
    );

  return (
    <div
      data-slot="usage-meter"
      data-state={state}
      className={cn(
        "grid gap-3 rounded-2xl border bg-card p-5 text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
        variant === "ring" && "sm:grid-cols-[auto_1fr] sm:items-center sm:gap-6",
        className,
      )}
      {...props}
    >
      {variant === "ring" && <div className="mx-auto sm:mx-0">{visual}</div>}
      <div className="grid min-w-0 gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id={labelId} className="text-sm font-semibold tracking-tight">
              {label}
            </p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">
              {fmt.format(used)}
              <span className="ms-1 text-sm font-normal text-muted-foreground">
                / {fmt.format(limit)}
                {unit ? ` ${unit}` : ""}
              </span>
            </p>
          </div>
          {action}
        </div>
        {variant === "bar" && visual}
        <div
          role="meter"
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)}
          aria-valuetext={`${text}. ${stateText}.`}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <StateIcon aria-hidden="true" className={cn("size-4", iconTone)} />
            {stateText}
          </span>
          {note && <span className="text-muted-foreground">· {note}</span>}
        </div>
        {segments && (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t pt-3 text-[13px]">
            {segments.map((s, i) => (
              <li key={s.label} className="flex items-center gap-2">
                <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-[3px]", SEGMENT_COLORS[i % SEGMENT_COLORS.length])} />
                <span className="truncate text-muted-foreground">{s.label}</span>
                <span className="ms-auto font-medium tabular-nums">
                  {fmt.format(s.value)}
                  {unit ? ` ${unit}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function RingVisual({ percent, state, reduce }: { percent: number; state: "ok" | "warn" | "over"; reduce: boolean }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-28" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={state === "over" ? "stroke-destructive" : state === "warn" ? "stroke-chart-3" : "stroke-primary"}
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - percent / 100) }}
          transition={{ duration: 0.9, ease: ease.out }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums">
        {Math.round(percent)}%
      </span>
    </div>
  );
}

export { UsageMeter, type UsageMeterProps, type UsageSegment };
