// Ballmac UI: Calendar. https://ui.ballmac.com/components/calendar
// Based on shadcn/ui Calendar (MIT, Copyright (c) 2023 shadcn) on React DayPicker (MIT, Copyright (c) Giampaolo Bellavite), restyled with a token-driven day grid, rounded range ends, styled month and year selects, and a footer slot.
"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** Draw a border, padding and background around the calendar. Turn off inside a popover or card. */
  bordered?: boolean;
};

/**
 * A date grid for picking one day, several days or a range (`mode="single" | "multiple" | "range"`).
 * All React DayPicker props work: `selected`, `onSelect`, `disabled`, `fromDate`/`toDate`, `numberOfMonths`,
 * `captionLayout="dropdown"` for month and year selects, `showWeekNumber`, and `locale`.
 * Arrow keys move between days, PageUp/PageDown change month, Home/End jump within the week.
 */
function Calendar({
  className,
  classNames,
  bordered = false,
  showOutsideDays = true,
  captionLayout = "label",
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn(
        "group/calendar w-fit select-none [--cell-size:2.25rem]",
        bordered && "rounded-xl border bg-card p-3 text-card-foreground shadow-xs",
        className,
      )}
      classNames={{
        root: "relative",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex w-full flex-col gap-3",
        nav: "absolute inset-x-0 top-0 z-10 flex h-(--cell-size) items-center justify-between",
        button_previous: navButton,
        button_next: navButton,
        month_caption: "flex h-(--cell-size) items-center justify-center px-(--cell-size)",
        caption_label: cn(
          "text-sm font-semibold",
          captionLayout !== "label" &&
            "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm font-medium [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
        ),
        dropdowns: "flex h-(--cell-size) items-center justify-center gap-1.5 text-sm font-medium",
        dropdown_root:
          "relative rounded-md border border-input shadow-xs has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        months_dropdown: "",
        years_dropdown: "",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "flex-1 pb-1 text-center text-[0.75rem] font-medium text-muted-foreground",
        week: "mt-1 flex w-full",
        week_number_header: "w-(--cell-size)",
        week_number: "w-(--cell-size) text-center text-xs text-muted-foreground",
        day: dayCell,
        day_button: dayButton,
        range_start: "rounded-l-md bg-accent [&>button]:rounded-md",
        range_middle: "rounded-none bg-accent [&>button]:!bg-transparent [&>button]:!text-accent-foreground [&>button]:hover:!bg-foreground/10",
        range_end: "rounded-r-md bg-accent [&>button]:rounded-md",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        today:
          "[&>button]:font-semibold [&:not([aria-selected=true])>button:not([data-range-middle])]:bg-accent [&:not([aria-selected=true])>button]:after:absolute [&:not([aria-selected=true])>button]:after:bottom-1 [&:not([aria-selected=true])>button]:after:left-1/2 [&:not([aria-selected=true])>button]:after:size-1 [&:not([aria-selected=true])>button]:after:-translate-x-1/2 [&:not([aria-selected=true])>button]:after:rounded-full [&:not([aria-selected=true])>button]:after:bg-primary",
        outside: "text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-40 [&>button]:pointer-events-none",
        hidden: "invisible",
        footer: "mt-2 text-sm text-muted-foreground",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: c, ...rest }) => {
          const Icon =
            orientation === "left" ? ChevronLeft : orientation === "right" ? ChevronRight : ChevronDown;
          return <Icon aria-hidden="true" className={cn("size-4", c)} {...(rest as object)} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}

const navButton =
  "inline-flex size-(--cell-size) items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-40";
const dayCell = "group/day relative aspect-square h-(--cell-size) w-(--cell-size) flex-1 p-0 text-center text-sm";
const dayButton =
  "relative flex size-full items-center justify-center rounded-md text-sm font-normal tabular-nums outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none";

export { Calendar, type CalendarProps };
