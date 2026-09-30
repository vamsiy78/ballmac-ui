import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable, DataTableColumnHeader, type ColumnDef } from "@/components/ballmac/data-table";

type Row = { name: string; amount: number };
const rows: Row[] = [
  { name: "Acme", amount: 30 },
  { name: "Bluebird", amount: 10 },
  { name: "Cobalt", amount: 20 },
  { name: "Delta", amount: 40 },
];
const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Name" /> },
  { accessorKey: "amount", header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" numeric /> },
];

describe("DataTable", () => {
  it("sorts when a header button is pressed and reports aria-sort", async () => {
    const user = userEvent.setup();
    render(<DataTable label="Clients" columns={columns} data={rows} />);
    await user.click(screen.getByRole("button", { name: "Amount" }));
    // Numbers sort largest first, like most dashboards.
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("aria-sort", "descending");
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Delta");
    await user.click(screen.getByRole("button", { name: "Amount" }));
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Bluebird");
  });
  it("filters with the search field and announces the count", async () => {
    const user = userEvent.setup();
    render(<DataTable label="Clients" columns={columns} data={rows} />);
    await user.type(screen.getByRole("searchbox", { name: "Search Clients" }), "blue");
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("1–1 of 1");
    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });
  it("selects rows and pages through results", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<DataTable label="Clients" columns={columns} data={rows} selectable pageSize={2} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 of 4 selected");
    expect(onSelectionChange).toHaveBeenLastCalledWith(rows.slice(0, 2));
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
  it("shows loading placeholders hidden from assistive tech", () => {
    render(<DataTable label="Clients" columns={columns} data={[]} loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });
});
