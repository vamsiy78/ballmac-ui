import * as React from "react"

import { Button } from "@/components/ballmac/button"
import { DataGrid, type DataGridColumn, type DataGridSort } from "@/components/ballmac/data-grid"

type Invoice = { id: string; client: string; amount: number; status: string }

const initial: Invoice[] = [
  { id: "INV-1041", client: "Northwind", amount: 4200, status: "open" },
  { id: "INV-1042", client: "Contoso Labs", amount: 1280, status: "paid" },
  { id: "INV-1043", client: "Fabrikam", amount: 9640, status: "open" },
  { id: "INV-1044", client: "Tailspin", amount: 760, status: "overdue" },
  { id: "INV-1045", client: "Wingtip", amount: 3115, status: "open" },
  { id: "INV-1046", client: "Litware", amount: 5480, status: "paid" },
]

const columns: DataGridColumn<Invoice>[] = [
  { id: "id", header: "Invoice", accessorKey: "id", width: 120 },
  { id: "client", header: "Client", accessorKey: "client", width: 170, editable: true },
  { id: "amount", header: "Amount", accessorKey: "amount", type: "number", width: 120, editable: true, numberFormat: { style: "currency", currency: "USD", maximumFractionDigits: 0 } },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    type: "select",
    width: 130,
    editable: true,
    options: [
      { value: "open", label: "Open", tone: "warning" },
      { value: "paid", label: "Paid", tone: "success" },
      { value: "overdue", label: "Overdue", tone: "error" },
    ],
  },
]

export default function DataGridControlled() {
  const [data, setData] = React.useState(initial)
  const [selected, setSelected] = React.useState<string[]>([])
  const [sorting, setSorting] = React.useState<DataGridSort[]>([{ id: "amount", desc: true }])
  const markPaid = () => {
    setData((rows) => rows.map((r) => (selected.includes(r.id) ? { ...r, status: "paid" } : r)))
    setSelected([])
  }
  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {selected.length ? `${selected.length} selected` : "Select invoices to act on them"}
        </p>
        <Button size="sm" variant="outline" disabled={!selected.length} onClick={markPaid}>
          Mark as paid
        </Button>
      </div>
      <DataGrid label="Invoices" columns={columns} data={data} onDataChange={setData} selectable selectedRowIds={selected} onSelectedRowIdsChange={setSelected} sorting={sorting} onSortingChange={setSorting} height={248} />
    </div>
  )
}
