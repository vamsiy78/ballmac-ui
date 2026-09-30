"use client";
import { Badge } from "@/components/ballmac/badge";
import { DataTable, DataTableColumnHeader, type ColumnDef } from "@/components/ballmac/data-table";
type Invoice = { id: string; customer: string; email: string; status: "Paid" | "Pending" | "Overdue"; amount: number };
const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Northwind Studio", email: "billing@northwind.example", status: "Paid", amount: 1250 },
  { id: "INV-2042", customer: "Bluebird Labs", email: "ap@bluebird.example", status: "Pending", amount: 480 },
  { id: "INV-2043", customer: "Harbor & Co", email: "finance@harbor.example", status: "Paid", amount: 2310 },
  { id: "INV-2044", customer: "Kilo Systems", email: "pay@kilo.example", status: "Overdue", amount: 890 },
  { id: "INV-2045", customer: "Lumen Health", email: "ops@lumen.example", status: "Paid", amount: 3120 },
  { id: "INV-2046", customer: "Orbit Freight", email: "accounts@orbit.example", status: "Pending", amount: 760 },
  { id: "INV-2047", customer: "Pine & Oak", email: "hello@pineoak.example", status: "Paid", amount: 415 },
  { id: "INV-2048", customer: "Quartz Media", email: "billing@quartz.example", status: "Overdue", amount: 1980 },
  { id: "INV-2049", customer: "Ridge Outdoors", email: "ar@ridge.example", status: "Paid", amount: 640 },
  { id: "INV-2050", customer: "Sable Design", email: "studio@sable.example", status: "Pending", amount: 1105 },
];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const columns: ColumnDef<Invoice>[] = [
  { accessorKey: "id", meta: { label: "Invoice" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />, cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  {
    accessorKey: "customer",
    meta: { label: "Customer" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.customer}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" status={row.original.status === "Paid" ? "success" : row.original.status === "Pending" ? "warning" : "error"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    meta: { label: "Amount" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" numeric />,
    cell: ({ row }) => <div className="text-right tabular-nums">{money.format(row.original.amount)}</div>,
  },
];
export default function DataTableDemo() {
  return (
    <div className="w-full max-w-2xl">
      <DataTable
        label="Invoices"
        columns={columns}
        data={invoices}
        selectable
        pageSize={5}
        searchPlaceholder="Search invoices"
        initialSorting={[{ id: "amount", desc: true }]}
        getRowId={(r) => r.id}
      />
    </div>
  );
}
