import { DataGrid, type DataGridColumn } from "@/components/ballmac/data-grid"

type Task = { id: string; task: string; owner: string; status: string; due: string; hours: number; reviewed: boolean }

const rows: Task[] = [
  { id: "t1", task: "Design the sign-in flow", owner: "Maya Chen", status: "progress", due: "2026-11-04", hours: 12, reviewed: false },
  { id: "t2", task: "Write the billing webhook", owner: "Jonas Weber", status: "review", due: "2026-11-06", hours: 9, reviewed: true },
  { id: "t3", task: "Migrate the search index", owner: "Priya Nair", status: "todo", due: "2026-11-12", hours: 20, reviewed: false },
  { id: "t4", task: "Accessibility audit", owner: "Omar Haddad", status: "progress", due: "2026-11-09", hours: 14, reviewed: false },
  { id: "t5", task: "Empty-state illustrations", owner: "Maya Chen", status: "done", due: "2026-10-30", hours: 6, reviewed: true },
  { id: "t6", task: "Rate limit the public API", owner: "Jonas Weber", status: "blocked", due: "2026-11-15", hours: 11, reviewed: false },
  { id: "t7", task: "Translate onboarding to Arabic", owner: "Layla Aziz", status: "progress", due: "2026-11-18", hours: 16, reviewed: false },
  { id: "t8", task: "Dark-mode contrast pass", owner: "Priya Nair", status: "todo", due: "2026-11-20", hours: 5, reviewed: false },
  { id: "t9", task: "Release notes for 2.4", owner: "Omar Haddad", status: "done", due: "2026-10-28", hours: 3, reviewed: true },
  { id: "t10", task: "Load test the checkout", owner: "Jonas Weber", status: "review", due: "2026-11-02", hours: 8, reviewed: false },
]

const columns: DataGridColumn<Task>[] = [
  { id: "task", header: "Task", accessorKey: "task", width: 260, pin: "start", editable: true },
  { id: "owner", header: "Owner", accessorKey: "owner", width: 150, editable: true },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    type: "select",
    width: 140,
    editable: true,
    options: [
      { value: "todo", label: "To do" },
      { value: "progress", label: "In progress", tone: "warning" },
      { value: "review", label: "In review", tone: "warning" },
      { value: "blocked", label: "Blocked", tone: "error" },
      { value: "done", label: "Done", tone: "success" },
    ],
  },
  { id: "due", header: "Due", accessorKey: "due", type: "date", width: 140, editable: true },
  { id: "hours", header: "Hours", accessorKey: "hours", type: "number", width: 96, editable: true },
  { id: "reviewed", header: "Reviewed", accessorKey: "reviewed", type: "boolean", width: 110, align: "center", editable: true },
]

export default function DataGridDemo() {
  return <DataGrid label="Sprint tasks" columns={columns} defaultData={rows} height={288} className="w-full max-w-4xl" footer="Enter to edit · Ctrl+Z to undo" />
}
