// Ballmac UI: Date Picker. https://ui.ballmac.com/components/date-picker
"use client";

import * as React from "react";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ballmac/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover";
import { cn } from "@/lib/utils";

type DatePickerPreset = {
  /** Button label, for example "Tomorrow". */
  label: string;
  /** The date the preset selects. Build it with `new Date(y, m, d)` so it is local midnight. */
  date: Date;
};

type DatePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> & {
  /** Controlled date. Pass `null` for a controlled empty value; `undefined` leaves the picker uncontrolled. */
  value?: Date | null;
  /** Initial date when uncontrolled. */
  defaultValue?: Date;
  /** Called with the new date, or `undefined` when cleared. */
  onValueChange?: (date: Date | undefined) => void;
  /** Text on the trigger when no date is chosen. */
  placeholder?: string;
  /** Locale for the trigger text and calendar. The default keeps server and browser output identical. */
  locale?: string;
  /** Formatting options for the trigger text. */
  format?: Intl.DateTimeFormatOptions;
  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /** Quick picks shown beside the calendar. */
  presets?: DatePickerPreset[];
  /** Show a control that clears the date. */
  clearable?: boolean;
  /** Mark the field invalid (`aria-invalid`, destructive border). */
  invalid?: boolean;
  /** Name of a hidden input that submits the date as YYYY-MM-DD. */
  name?: string;
  /** Show month and year selects in the calendar header. */
  dropdowns?: boolean;
};

function toIso(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
const sameDay = (a?: Date, b?: Date) => !!a && !!b && toIso(a) === toIso(b);

/** A button that opens a calendar popover to choose one date, with optional presets and form submission. */
function DatePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  locale = "en-US",
  format = { dateStyle: "medium" },
  minDate,
  maxDate,
  presets,
  clearable = false,
  invalid = false,
  name,
  dropdowns = false,
  disabled,
  className,
  "aria-label": ariaLabel,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState<Date | undefined>(defaultValue);
  const value = valueProp === undefined ? inner : (valueProp ?? undefined);
  const choose = (next: Date | undefined) => {
    setInner(next);
    onValueChange?.(next);
    if (next) setOpen(false);
  };
  const text = value ? new Intl.DateTimeFormat(locale, format).format(value) : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger
          data-slot="date-picker"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel ? `${ariaLabel}${value ? `, ${text}` : ""}` : undefined}
          className={cn(
            "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30",
            !value && "text-muted-foreground",
            clearable && value && "pr-10",
            className,
          )}
          {...props}
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{text}</span>
        </PopoverTrigger>
        {clearable && value && !disabled && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => choose(undefined)}
            className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        )}
        {name && <input type="hidden" name={name} value={value ? toIso(value) : ""} />}
      </div>
      <PopoverContent
        label={ariaLabel ?? placeholder}
        align="start"
        className="w-auto max-w-[calc(100vw-1.5rem)] gap-0 p-0"
      >
        <div className="flex flex-col sm:flex-row">
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-b p-3 sm:w-36 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={sameDay(p.date, value)}
                  onClick={() => choose(p.date)}
                  className="h-8 rounded-md px-2.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-accent aria-pressed:font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <Calendar
            className="p-3"
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={choose}
            disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
            captionLayout={dropdowns ? "dropdown" : "label"}
            startMonth={dropdowns ? (minDate ?? new Date(new Date().getFullYear() - 100, 0)) : undefined}
            endMonth={dropdowns ? (maxDate ?? new Date(new Date().getFullYear() + 10, 11)) : undefined}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, type DatePickerProps, type DatePickerPreset };
