import { ParallelAttempts, type Attempt } from "@/components/ballmac/parallel-attempts"

const attempts: Attempt[] = [
  { id: "a", label: "Attempt A", model: "fast-small", status: "done", summary: "Adds the retry in the invoice view and leaves the shared helper alone. Two tests need updating.", added: 84, removed: 12, files: 4, duration: "1 min 12 s", cost: "$0.08" },
  { id: "b", label: "Attempt B", model: "balanced", status: "done", summary: "Moves the retry into the shared helper, adds a backoff and covers it with three new tests.", added: 142, removed: 38, files: 7, duration: "2 min 40 s", cost: "$0.31" },
  { id: "c", label: "Attempt C", model: "deep-reasoner", status: "running", summary: "Reading the payment client to see where the failure surfaces before changing anything.", progress: 58, duration: "3 min 5 s so far", cost: "$0.44" },
  { id: "d", label: "Attempt D", model: "fast-small", status: "failed", summary: "Stopped after the type check failed twice on the same file.", added: 20, removed: 4, files: 2, duration: "0 min 48 s", cost: "$0.04" },
]

export default function ParallelAttemptsDemo() {
  return (
    <div className="w-full max-w-4xl">
      <ParallelAttempts attempts={attempts} recommended="b" defaultValue="b" />
    </div>
  )
}
