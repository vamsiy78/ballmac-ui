"use client"

import { WaterfallChart } from "@/components/ballmac/waterfall-chart"

export default function WaterfallChartNegative() {
  return (
    <div className="w-full max-w-3xl">
      <WaterfallChart
        title="Cash position over the quarter"
        height={240}
        format={(v) => `${v < 0 ? "−" : ""}$${Math.abs(v / 1000).toFixed(0)}k`}
        steps={[
          { id: "open", label: "Opening cash", value: 120000, kind: "total" },
          { id: "sales", label: "Sales", value: 310000 },
          { id: "pay", label: "Payroll", value: -240000 },
          { id: "sup", label: "Suppliers", value: -210000 },
          { id: "tax", label: "Tax", value: -60000 },
          { id: "loan", label: "Loan drawn", value: 50000 },
          { id: "close", label: "Closing cash", value: -30000, kind: "total" },
        ]}
      />
    </div>
  )
}