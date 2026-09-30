"use client";
import { DataTable, type ColumnDef } from "@/components/ballmac/data-table";
type Row = { name: string; role: string };
const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
];
export default function DataTableStates() {
  return (
    <div className="grid w-full max-w-md gap-6">
      <DataTable label="Loading members" columns={columns} data={[]} loading searchable={false} columnToggle={false} pageSize={4} />
      <DataTable
        label="Empty members"
        columns={columns}
        data={[]}
        searchable={false}
        columnToggle={false}
        emptyMessage="No members yet. Invite your first teammate to get started."
      />
    </div>
  );
}
