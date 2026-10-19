"use client"

import { DataGrid, type DataGridColumn } from "@/components/ballmac/data-grid"

type Row = { id: string; name: string; plan: string; seats: number }

const columns: DataGridColumn<Row>[] = [
  { id: "name", header: "Workspace", accessorKey: "name", width: 220 },
  { id: "plan", header: "Plan", accessorKey: "plan", width: 140 },
  { id: "seats", header: "Seats", accessorKey: "seats", type: "number", width: 100 },
]

export default function DataGridLoading() {
  return <DataGrid label="Workspaces" columns={columns} data={[]} state="loading" height={248} className="w-full max-w-xl" />
}
