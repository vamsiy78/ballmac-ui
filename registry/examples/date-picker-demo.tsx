"use client";
import * as React from "react";
import { DatePicker, type DatePickerPreset } from "@/components/ballmac/date-picker";
import { Field, FieldDescription, FieldLabel, useFieldControl } from "@/components/ballmac/field";

// "Today", "Tomorrow" and "In a week" depend on the current date, so this reads it inside <Suspense>: Next.js Cache Components (the
// default in new Next.js 16.4 apps) does not allow reading the current time while a page is prerendered.
function Picker() {
  const { id, "aria-describedby": describedby } = useFieldControl();
  const presets = React.useMemo<DatePickerPreset[]>(() => {
    const now = new Date();
    const at = (d: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    return [
      { label: "Today", date: at(0) },
      { label: "Tomorrow", date: at(1) },
      { label: "In a week", date: at(7) },
      { label: "In a month", date: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()) },
    ];
  }, []);
  return (
    <DatePicker
      id={id}
      aria-describedby={describedby}
      aria-label="Delivery date"
      defaultValue={new Date(2026, 9, 14)}
      presets={presets}
      clearable
      minDate={new Date(2026, 8, 1)}
    />
  );
}
export default function DatePickerDemo() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel>Delivery date</FieldLabel>
      <React.Suspense fallback={<div aria-hidden="true" className="h-9 rounded-md border bg-card" />}>
        <Picker />
      </React.Suspense>
      <FieldDescription>We deliver Monday to Friday.</FieldDescription>
    </Field>
  );
}
