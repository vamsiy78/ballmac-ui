import { RunLedger, type LedgerRow } from "@/components/ballmac/run-ledger"

const rows: LedgerRow[] = [
  { id: "a", label: "Draft the migration", kind: "Model", tokensIn: 52_000, tokensOut: 9_100, ms: 61_000, cost: 0.74 },
  { id: "b", label: "Rewrite 38 call sites", kind: "Model", tokensIn: 210_000, tokensOut: 44_000, ms: 233_000, cost: 2.91 },
  { id: "c", label: "Fix the type errors", kind: "Model", tokensIn: 96_000, tokensOut: 18_500, ms: 118_000, cost: 1.12 },
]

export default function RunLedgerOver() {
  return (
    <div className="w-full max-w-2xl">
      <RunLedger rows={rows} budget={4} title="Migration run" defaultSort="time" />
    </div>
  )
}
