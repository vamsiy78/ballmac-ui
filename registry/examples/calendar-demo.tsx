"use client";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ballmac/calendar";
export default function CalendarDemo() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 8, 8),
    to: new Date(2026, 8, 15),
  });
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const nights = range?.from && range.to ? Math.round((range.to.getTime() - range.from.getTime()) / 86400000) : 0;
  return (
    <div className="w-fit max-w-full rounded-xl border bg-card p-3 shadow-sm">
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        defaultMonth={new Date(2026, 8)}
        disabled={{ before: new Date(2026, 8, 1) }}
        footer={
          range?.from && range.to
            ? `${fmt.format(range.from)} – ${fmt.format(range.to)} · ${nights} nights`
            : "Pick a check-in and check-out date."
        }
      />
    </div>
  );
}
