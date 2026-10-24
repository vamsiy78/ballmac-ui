import { RunLedger, type LedgerRow } from "@/components/ballmac/run-ledger"

const rows: LedgerRow[] = [
  { id: "plan", label: "Planner", kind: "Model", tokensIn: 6200, tokensOut: 1100, ms: 14_200, cost: 0.0612 },
  { id: "search", label: "Search the repo", kind: "Tool", ms: 3800, cost: 0 },
  { id: "research", label: "Researcher", kind: "Model", tokensIn: 41_300, tokensOut: 3900, ms: 38_400, cost: 0.4231 },
  { id: "code", label: "Coder", kind: "Model", tokensIn: 88_900, tokensOut: 12_400, ms: 92_100, cost: 1.2764 },
  { id: "tests", label: "Run the tests", kind: "Tool", ms: 41_600, cost: 0.012 },
  { id: "review", label: "Reviewer", kind: "Model", tokensIn: 19_800, tokensOut: 1700, ms: 17_300, cost: 0.1987 },
]

export default function RunLedgerDemo() {
  return (
    <div className="w-full max-w-2xl">
      <RunLedger rows={rows} budget={3} />
    </div>
  )
}
