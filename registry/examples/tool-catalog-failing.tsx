"use client"

import { ToolCatalog } from "@/components/ballmac/tool-catalog"

export default function ToolCatalogFailing() {
  return (
    <div className="w-full max-w-2xl">
      <ToolCatalog
        title="Tools for the billing agent"
        onToggle={() => Promise.reject(new Error("The tool service is unreachable, so nothing changed."))}
        tools={[
          { id: "a", name: "lookup_invoice", description: "Open an invoice by its number.", enabled: true, risk: "low", calls: 1200, errorRate: 0.01, latencyMs: 280 },
          { id: "b", name: "void_invoice", description: "Cancel an invoice that has not been paid.", enabled: false, risk: "high", calls: 0 },
        ]}
      />
    </div>
  )
}
