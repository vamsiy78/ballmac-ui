"use client";
import * as React from "react";
import { DatePicker } from "@/components/ballmac/date-picker";
import { Field, FieldError, FieldLabel } from "@/components/ballmac/field";
// A birthday can be any day up to today, so this reads the current date inside <Suspense> (Next.js Cache Components does not allow reading
// the current time while a page is prerendered).
function BirthdayPicker() {
  return (
    <DatePicker
      aria-label="Date of birth"
      placeholder="Select your birthday"
      dropdowns
      maxDate={new Date()}
      format={{ year: "numeric", month: "long", day: "numeric" }}
    />
  );
}
export default function DatePickerStates() {
  return (
    <div className="grid w-full max-w-xs gap-4">
      <Field>
        <FieldLabel>Date of birth</FieldLabel>
        <React.Suspense fallback={<div aria-hidden="true" className="h-9 rounded-md border bg-card" />}>
          <BirthdayPicker />
        </React.Suspense>
      </Field>
      <Field invalid>
        <FieldLabel required>Start date</FieldLabel>
        <DatePicker aria-label="Start date" invalid placeholder="Required" />
        <FieldError errors={["Choose a start date to continue."]} />
      </Field>
      <DatePicker aria-label="Locked date" disabled defaultValue={new Date(2026, 8, 30)} />
    </div>
  );
}
