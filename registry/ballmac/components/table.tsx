// Ballmac UI: Table. https://ui.ballmac.com/components/table
// Based on shadcn/ui Table (MIT, Copyright (c) 2023 shadcn), adding a focusable scroll region, sticky header, striping, density, and aria-sort.
import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type TableProps = React.ComponentProps<"table"> & {
  /** Accessible name of the scroll region that wraps the table. Recommended whenever the table can scroll. */
  label?: string;
  /** Keep the header row visible while the body scrolls (give the table a max height with `containerClassName`). */
  stickyHeader?: boolean;
  /** Shade every second body row. */
  striped?: boolean;
  /** Row height. */
  density?: "compact" | "default" | "comfortable";
  /** Classes for the scroll container, for example `max-h-80`. */
  containerClassName?: string;
};
function Table({
  className,
  containerClassName,
  label,
  stickyHeader = false,
  striped = false,
  density = "default",
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "relative w-full overflow-auto rounded-xl border bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        data-sticky={stickyHeader ? "" : undefined}
        data-striped={striped ? "" : undefined}
        data-density={density}
        className={cn(
          "group/table w-full caption-bottom border-separate border-spacing-0 text-sm",
          className,
        )}
        {...props}
      />
    </div>
  );
}

type TableHeaderProps = React.ComponentProps<"thead">;
function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-muted/50 group-data-[sticky]/table:sticky group-data-[sticky]/table:top-0 group-data-[sticky]/table:z-10 group-data-[sticky]/table:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

type TableBodyProps = React.ComponentProps<"tbody">;
function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child_td]:border-b-0", className)}
      {...props}
    />
  );
}

type TableFooterProps = React.ComponentProps<"tfoot">;
function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 font-medium [&_td]:border-t [&_td]:border-b-0", className)}
      {...props}
    />
  );
}

type TableRowProps = React.ComponentProps<"tr"> & {
  /** Mark the row as selected (also sets `aria-selected`). */
  selected?: boolean;
};
function TableRow({ className, selected, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      aria-selected={selected || undefined}
      className={cn(
        "transition-colors hover:bg-muted/50 group-data-[striped]/table:even:bg-muted/30 data-[state=selected]:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

type TableHeadProps = React.ComponentProps<"th"> & {
  /** Sort state of this column. Sets `aria-sort` and shows a direction icon; wrap the label in a button to make it interactive. */
  sort?: "ascending" | "descending" | "none";
  /** Right-align and use tabular numbers. */
  numeric?: boolean;
};
function TableHead({
  className,
  sort,
  numeric,
  children,
  scope = "col",
  ...props
}: TableHeadProps) {
  const Icon =
    sort === "ascending" ? ArrowUp : sort === "descending" ? ArrowDown : ChevronsUpDown;
  return (
    <th
      data-slot="table-head"
      scope={scope}
      aria-sort={sort}
      className={cn(
        "h-10 border-b px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    >
      {sort ? (
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            numeric && "flex-row-reverse",
          )}
        >
          {children}
          <Icon aria-hidden="true" className="size-3.5 opacity-70" />
        </span>
      ) : (
        children
      )}
    </th>
  );
}

type TableCellProps = React.ComponentProps<"td"> & {
  /** Right-align and use tabular numbers. */
  numeric?: boolean;
};
function TableCell({ className, numeric, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "border-b px-3 align-middle group-data-[density=compact]/table:h-9 group-data-[density=default]/table:h-12 group-data-[density=comfortable]/table:h-16",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

type TableCaptionProps = React.ComponentProps<"caption">;
function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-3 mb-3 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type TableCaptionProps,
};
