import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ballmac/table";

describe("Table", () => {
  it("wraps the table in a focusable, named scroll region", () => {
    render(
      <Table label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead sort="ascending">Name</TableHead>
            <TableHead numeric>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow selected>
            <TableCell>Acme</TableCell>
            <TableCell numeric>$10</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const region = screen.getByRole("region", { name: "Invoices" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("row", { name: /Acme/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("cell", { name: "$10" })).toHaveClass("text-end");
  });
});
