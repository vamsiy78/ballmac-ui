"use client"

import * as React from "react"

import { HeatGrid } from "@/components/ballmac/heat-grid"

const rows = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((l) => ({ id: l, label: l }))
const columns = ["09", "11", "13", "15", "17", "19"].map((h) => ({ id: h, label: `${h}:00` }))
const values = [
  [12, 34, 41, 38, 22, 8],
  [15, 39, 52, 47, 26, 11],
  [14, 44, 61, 58, 31, 9],
  [18, 41, 55, 49, 28, 14],
  [11, 29, 33, 21, 12, null],
]

export default function HeatGridDemo() {
  const [cell, setCell] = React.useState<[number, number] | null>([2, 2])
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <HeatGrid rowLabel="Day" columnLabel="Hour" rows={rows} columns={columns} values={values} selected={cell} onSelectedChange={setCell} format={(v) => `${v}`} />
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {cell ? <>{rows[cell[0]].label} at {columns[cell[1]].label}: <strong className="text-foreground">{values[cell[0]][cell[1]] ?? "no data"}</strong> orders</> : "Select a cell."}
      </p>
    </div>
  )
}
