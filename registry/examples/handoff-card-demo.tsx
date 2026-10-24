import { HandoffCard } from "@/components/ballmac/handoff-card"

export default function HandoffCardDemo() {
  return (
    <div className="w-full max-w-xl">
      <HandoffCard
        from={{ name: "Planner", role: "Breaks down the task" }}
        to={{ name: "Coder", role: "Writes the change" }}
        title="Add a retry with backoff to the invoice export"
        at="2:14 pm"
        context={[
          { label: "The plan", detail: "four steps, one open", size: "1.2k tokens" },
          { label: "Relevant files", detail: "export.ts, client.ts, three tests", size: "8.4k tokens" },
          { label: "Ticket thread", detail: "customer reports a timeout", size: "2.1k tokens" },
        ]}
        questions={["Should a failed export be retried for large accounts too?"]}
        constraints={["Do not change the public API", "Keep the change under 200 lines", "No new dependencies"]}
      />
    </div>
  )
}
