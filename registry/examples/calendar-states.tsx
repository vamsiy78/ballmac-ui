"use client";
import * as React from "react";
import { Calendar } from "@/components/ballmac/calendar";
export default function CalendarStates() {
  const [days, setDays] = React.useState<Date[] | undefined>([new Date(2026, 8, 3), new Date(2026, 8, 17), new Date(2026, 8, 24)]);
  const [day, setDay] = React.useState<Date | undefined>(new Date(2026, 8, 21));
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="w-fit max-w-full rounded-xl border bg-card p-3">
        <Calendar
          mode="single"
          selected={day}
          onSelect={setDay}
          defaultMonth={new Date(2026, 8)}
          captionLayout="dropdown"
          startMonth={new Date(2024, 0)}
          endMonth={new Date(2028, 11)}
          disabled={{ dayOfWeek: [0, 6] }}
          showWeekNumber
        />
      </div>
      <div className="w-fit max-w-full rounded-xl border bg-card p-3">
        <Calendar
          mode="multiple"
          selected={days}
          onSelect={setDays}
          defaultMonth={new Date(2026, 8)}
          max={4}
          footer={`${days?.length ?? 0} of 4 days selected`}
        />
      </div>
    </div>
  );
}
