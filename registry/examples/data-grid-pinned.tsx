"use client"

import { DataGrid, type DataGridColumn } from "@/components/ballmac/data-grid"

type Quote = { id: string; symbol: string; name: string; price: number; change: number; volume: number; high: number; low: number; cap: number; pe: number; sector: string }

const rows: Quote[] = [
  { id: "1", symbol: "ACME", name: "Acme Industrial", price: 128.4, change: 1.8, volume: 3_420_000, high: 130.1, low: 125.2, cap: 48.2, pe: 21.3, sector: "Industrials" },
  { id: "2", symbol: "NOVA", name: "Nova Semiconductor", price: 412.75, change: -0.9, volume: 8_910_000, high: 419.9, low: 408.3, cap: 310.5, pe: 34.8, sector: "Technology" },
  { id: "3", symbol: "HRBR", name: "Harbor Logistics", price: 54.1, change: 0.4, volume: 1_240_000, high: 54.9, low: 53.2, cap: 12.7, pe: 15.6, sector: "Transport" },
  { id: "4", symbol: "LUMN", name: "Lumen Energy", price: 77.9, change: 2.6, volume: 5_030_000, high: 78.4, low: 75.1, cap: 29.9, pe: 12.1, sector: "Energy" },
  { id: "5", symbol: "FRGE", name: "Forge Materials", price: 203.3, change: -1.7, volume: 2_180_000, high: 207.6, low: 201.8, cap: 41.0, pe: 18.9, sector: "Materials" },
  { id: "6", symbol: "BLOM", name: "Bloom Foods", price: 36.55, change: 0.1, volume: 4_770_000, high: 36.9, low: 36.0, cap: 9.4, pe: 24.4, sector: "Consumer" },
  { id: "7", symbol: "PANE", name: "Pane Software", price: 288.0, change: 3.2, volume: 6_320_000, high: 291.5, low: 279.4, cap: 122.3, pe: 41.0, sector: "Technology" },
  { id: "8", symbol: "CNPY", name: "Canopy Health", price: 91.2, change: -0.3, volume: 1_890_000, high: 92.4, low: 90.1, cap: 22.6, pe: 27.7, sector: "Health care" },
]

const num = (id: keyof Quote, header: string, options?: Intl.NumberFormatOptions, width = 110): DataGridColumn<Quote> => ({ id, header, accessorKey: id, type: "number", width, numberFormat: options })

const columns: DataGridColumn<Quote>[] = [
  { id: "symbol", header: "Symbol", accessorKey: "symbol", width: 100, pin: "start" },
  { id: "name", header: "Company", accessorKey: "name", width: 200, pin: "start" },
  num("price", "Price", { style: "currency", currency: "USD" }),
  num("change", "Change %", { signDisplay: "exceptZero", minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  num("volume", "Volume", { notation: "compact" }),
  num("high", "Day high", { minimumFractionDigits: 2 }),
  num("low", "Day low", { minimumFractionDigits: 2 }),
  num("cap", "Market cap (B)", { minimumFractionDigits: 1 }, 150),
  num("pe", "P/E", { minimumFractionDigits: 1 }, 90),
  { id: "sector", header: "Sector", accessorKey: "sector", width: 150 },
]

export default function DataGridPinned() {
  return <DataGrid label="Quotes" columns={columns} data={rows} height={288} className="w-full max-w-xl" defaultSorting={[{ id: "cap", desc: true }]} footer="Drag a heading edge to resize" />
}
