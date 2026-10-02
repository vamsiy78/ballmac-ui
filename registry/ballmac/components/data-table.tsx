// Ballmac UI: Data Table. https://ui.ballmac.com/components/data-table
// Based on shadcn/ui Data Table (MIT, Copyright (c) 2023 shadcn) on TanStack Table (MIT, Copyright (c) 2016 Tanner Linsley), packaged as one component with sorting, search, column visibility, row selection, pagination, a loading state, and live result announcements.
"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Columns3, Search } from "lucide-react";
import { Button } from "@/components/ballmac/button";
import { Checkbox } from "@/components/ballmac/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ballmac/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ballmac/table";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type DataTableProps<TData, TValue = unknown> = Omit<React.ComponentProps<"div">, "children"> & {
  /** Column definitions from TanStack Table. Use `DataTableColumnHeader` in `header` for sortable columns, and `meta: { label: "Name" }` to name a column in the Columns menu. */
  columns: ColumnDef<TData, TValue>[];
  /** Rows to display. */
  data: TData[];
  /** Accessible name of the table. Also names the scroll region. */
  label: string;
  /** Add a leading checkbox column for selecting rows. */
  selectable?: boolean;
  /** Called with the selected row objects whenever the selection changes. */
  onSelectionChange?: (rows: TData[]) => void;
  /** Show a search field that filters across every column. */
  searchable?: boolean;
  /** Placeholder of the search field. */
  searchPlaceholder?: string;
  /** Show a menu for hiding and showing columns. */
  columnToggle?: boolean;
  /** Rows per page. Set to 0 to disable pagination. */
  pageSize?: number;
  /** Show placeholder rows while data loads. */
  loading?: boolean;
  /** Message when there are no rows or no matches. */
  emptyMessage?: React.ReactNode;
  /** Initial sort, for example `[{ id: "amount", desc: true }]`. */
  initialSorting?: SortingState;
  /** Extra content on the right of the toolbar, such as an export button. */
  toolbar?: React.ReactNode;
  /** Give every row a stable id. Defaults to the row index. */
  getRowId?: (row: TData, index: number) => string;
  /** Keep the header visible while the body scrolls. Combine with `maxHeightClassName`. */
  stickyHeader?: boolean;
  /** Height limit for the scroll area, for example `max-h-96`. */
  maxHeightClassName?: string;
};

function SelectAllCheckbox<TData>({ table }: { table: TanstackTable<TData> }) {
  const msg = useMessages();
  return (
    <Checkbox
      aria-label={msg("data-table.selectAllRows", "Select all rows on this page")}
      checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
    />
  );
}

function SelectRowCheckbox<TData>({ row }: { row: Row<TData> }) {
  const msg = useMessages();
  return (
    <Checkbox
      aria-label={msg("data-table.selectRow", "Select row {n}", { n: row.index + 1 })}
      checked={row.getIsSelected()}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
    />
  );
}

function selectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: SelectAllCheckbox,
    cell: SelectRowCheckbox,
  };
}

/**
 * A complete data grid on TanStack Table: click headers to sort, search, hide columns, select rows and page through results.
 * Sorting, filtering and paging run in the browser; for server data, use TanStack's manual modes by building on the same parts.
 */
function DataTable<TData, TValue = unknown>({
  columns,
  data,
  label,
  selectable = false,
  onSelectionChange,
  searchable = true,
  searchPlaceholder,
  columnToggle = true,
  pageSize = 8,
  loading = false,
  emptyMessage,
  initialSorting = [],
  toolbar,
  getRowId,
  stickyHeader = false,
  maxHeightClassName,
  className,
  ...props
}: DataTableProps<TData, TValue>) {
  const msg = useMessages()
  searchPlaceholder ??= msg("data-table.searchPlaceholder", "Search")
  emptyMessage ??= msg("data-table.emptyMessage", "No results.")
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const allColumns = React.useMemo(
    () => (selectable ? [selectionColumn<TData>() as ColumnDef<TData, TValue>, ...columns] : columns),
    [columns, selectable],
  );
  const paginated = pageSize > 0;
  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, globalFilter, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginated ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageIndex: 0, pageSize: paginated ? pageSize : Number.MAX_SAFE_INTEGER } },
  });

  const selected = table.getSelectedRowModel().rows;
  const onSelectionRef = React.useRef(onSelectionChange);
  React.useEffect(() => {
    onSelectionRef.current = onSelectionChange;
  });
  React.useEffect(() => {
    onSelectionRef.current?.(selected.map((r) => r.original));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const rows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const visibleColumns = table.getVisibleLeafColumns().length;
  const page = table.getState().pagination;
  const from = filteredCount === 0 ? 0 : page.pageIndex * page.pageSize + 1;
  const to = Math.min(filteredCount, (page.pageIndex + 1) * page.pageSize);

  return (
    <div data-slot="data-table" className={cn("grid w-full gap-3", className)} {...props}>
      {(searchable || columnToggle || toolbar) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                aria-label={msg("data-table.search", "Search {label}", { label })}
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  table.setPageIndex(0);
                }}
                className="h-9 w-full rounded-md border border-input bg-background pe-3 ps-8 text-sm shadow-xs outline-none transition-[color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>
          )}
          <div className="ms-auto flex items-center gap-2">
            {toolbar}
            {columnToggle && <ColumnMenu table={table} />}
          </div>
        </div>
      )}
      <Table
        label={label}
        aria-label={label}
        stickyHeader={stickyHeader}
        containerClassName={maxHeightClassName}
      >
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  sort={
                    header.column.getCanSort()
                      ? (header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none")
                      : undefined
                  }
                  sortIcon={false}
                  className={cn(header.column.id === "select" && "w-10")}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: Math.min(pageSize || 5, 5) }, (_, r) => (
              <TableRow key={r} aria-hidden="true">
                {Array.from({ length: visibleColumns }, (_, c) => (
                  <TableCell key={c}>
                    <span className="block h-4 animate-pulse rounded bg-muted motion-reduce:animate-none" style={{ width: `${55 + ((r * 7 + c * 13) % 35)}%` }} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id} selected={row.getIsSelected()}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p aria-live="polite" role="status">
          {selectable && selected.length > 0
            ? `${selected.length} of ${filteredCount} selected`
            : loading
              ? "Loading…"
              : filteredCount === 0
                ? "0 results"
                : `${from}–${to} of ${filteredCount}`}
        </p>
        {paginated && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={msg("data-table.previousPage", "Previous page")}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft aria-hidden="true"  className="rtl:rotate-180"/>
            </Button>
            <span className="min-w-20 text-center tabular-nums">
              {msg("data-table.pageOf", "Page {page} of {total}", { page: Math.min(page.pageIndex + 1, Math.max(table.getPageCount(), 1)), total: Math.max(table.getPageCount(), 1) })}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={msg("data-table.nextPage", "Next page")}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight aria-hidden="true"  className="rtl:rotate-180"/>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Name shown in the column menu: `meta.label`, else a string header, else the id with its first letter capitalised. */
function columnLabel<TData>(column: Column<TData, unknown>) {
  const meta = column.columnDef.meta as { label?: string } | undefined;
  if (meta?.label) return meta.label;
  if (typeof column.columnDef.header === "string") return column.columnDef.header;
  return column.id.charAt(0).toUpperCase() + column.id.slice(1);
}

function ColumnMenu<TData>({ table }: { table: TanstackTable<TData> }) {
  const msg = useMessages()
  const hideable = table.getAllColumns().filter((c) => c.getCanHide());
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30">
        <Columns3 aria-hidden="true" className="size-4 text-muted-foreground" />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{msg("data-table.showColumns", "Show columns")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(v) => column.toggleVisibility(!!v)}
            onSelect={(e) => e.preventDefault()}
          >
            {columnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type DataTableColumnHeaderProps<TData, TValue> = React.ComponentProps<"button"> & {
  /** The column from the header context: `header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />`. */
  column: Column<TData, TValue>;
  /** Visible column title. */
  title: string;
  /** Right-align the title for numeric columns. */
  numeric?: boolean;
};

/** A header button that cycles ascending, descending and unsorted, with a direction icon. */
function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  numeric,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <span className={cn(numeric && "block text-end")}>{title}</span>;
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;
  return (
    <button
      type="button"
      data-slot="data-table-column-header"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "-mx-1.5 inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        numeric && "flex-row-reverse",
        className,
      )}
      {...props}
    >
      {title}
      <Icon aria-hidden="true" className={cn("size-3.5", sorted ? "text-foreground" : "text-muted-foreground")} />
    </button>
  );
}

export {
  DataTable,
  DataTableColumnHeader,
  type DataTableProps,
  type DataTableColumnHeaderProps,
  type ColumnDef,
};
