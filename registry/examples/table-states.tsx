"use client";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ballmac/table";
const rows = [
  { name: "Ana Lima", team: "Design", commits: 128 },
  { name: "Kofi Mensah", team: "Platform", commits: 342 },
  { name: "Mei Tanaka", team: "Growth", commits: 87 },
  { name: "Sam Okafor", team: "Platform", commits: 215 },
  { name: "Ivy Chen", team: "Design", commits: 154 },
  { name: "Leo Duarte", team: "Growth", commits: 63 },
];
export default function TableStates() {
  const [dir, setDir] = React.useState<"ascending" | "descending">("descending");
  const [selected, setSelected] = React.useState("Kofi Mensah");
  const sorted = [...rows].sort((a, b) =>
    dir === "ascending" ? a.commits - b.commits : b.commits - a.commits,
  );
  return (
    <div className="w-full max-w-md">
      <Table label="Contributors" stickyHeader density="compact" containerClassName="max-h-60">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead numeric sort={dir}>
              <button
                type="button"
                onClick={() => setDir(dir === "ascending" ? "descending" : "ascending")}
                className="rounded outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Commits
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.name} selected={selected === r.name} onClick={() => setSelected(r.name)}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-muted-foreground">{r.team}</TableCell>
              <TableCell numeric>{r.commits}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
