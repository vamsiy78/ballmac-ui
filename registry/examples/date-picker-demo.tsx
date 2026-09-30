"use client";
import * as React from "react";
import { DatePicker, type DatePickerPreset } from "@/components/ballmac/date-picker";
import { Field, FieldDescription, FieldLabel, useFieldControl } from "@/components/ballmac/field";

function Picker({ presets }: { presets: DatePickerPreset[] }) {
  const { id, "aria-describedby": describedby } = useFieldControl();
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
    <Field className="w-full max-w-xs">
      <FieldLabel>Delivery date</FieldLabel>
      <Picker presets={presets} />
      <FieldDescription>We deliver Monday to Friday.</FieldDescription>
    </Field>
  );
}
