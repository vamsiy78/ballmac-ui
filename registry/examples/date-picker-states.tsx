"use client";
import { DatePicker } from "@/components/ballmac/date-picker";
import { Field, FieldError, FieldLabel } from "@/components/ballmac/field";
export default function DatePickerStates() {
  return (
    <div className="grid w-full max-w-xs gap-4">
      <Field>
        <FieldLabel>Date of birth</FieldLabel>
        <DatePicker
          aria-label="Date of birth"
          placeholder="Select your birthday"
          dropdowns
          maxDate={new Date()}
          format={{ year: "numeric", month: "long", day: "numeric" }}
        />
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
