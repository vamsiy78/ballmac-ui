"use client"

import { DataGrid, type DataGridColumn } from "@/components/ballmac/data-grid"

type Seat = { id: string; name: string; email: string; seats: number; budget: number }

const rows: Seat[] = [
  { id: "s1", name: "Design", email: "design@acme.example", seats: 14, budget: 5600 },
  { id: "s2", name: "Engineering", email: "eng@acme.example", seats: 42, budget: 21000 },
  { id: "s3", name: "Support", email: "support@acme.example", seats: 18, budget: 4300 },
  { id: "s4", name: "Finance", email: "finance@acme.example", seats: 6, budget: 2400 },
  { id: "s5", name: "People", email: "people@acme.example", seats: 5, budget: 1800 },
]

const columns: DataGridColumn<Seat>[] = [
  { id: "name", header: "Team", accessorKey: "name", width: 170, editable: true, validate: (v) => (String(v ?? "").trim() ? undefined : "A team needs a name.") },
  { id: "email", header: "Billing email", accessorKey: "email", width: 250, editable: true, validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "")) ? undefined : "Use an address like name@company.com.") },
  { id: "seats", header: "Seats", accessorKey: "seats", type: "number", width: 100, editable: true, validate: (v) => (typeof v === "number" && Number.isInteger(v) && v >= 1 ? undefined : "Seats are a whole number, at least 1.") },
  { id: "budget", header: "Budget", accessorKey: "budget", type: "number", width: 130, editable: true, numberFormat: { style: "currency", currency: "USD", maximumFractionDigits: 0 }, validate: (v) => (typeof v === "number" && v >= 0 ? undefined : "A budget cannot be negative.") },
]

export default function DataGridValidation() {
  return <DataGrid label="Team billing" columns={columns} defaultData={rows} height={248} className="w-full max-w-2xl" footer="Clear the email, then press Enter" />
}
