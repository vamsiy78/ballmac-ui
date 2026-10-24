import { GuardrailFeed, type GuardEvent } from "@/components/ballmac/guardrail-feed"

const events: GuardEvent[] = [
  { id: "1", time: "2:14:08 pm", rule: "No customer emails in replies", action: "redacted", target: "Draft reply to ticket 4821", reason: "The draft quoted the customer's email address. It was replaced before sending.", match: "…reach out to maria.lopez@example.com for…" },
  { id: "2", time: "2:13:52 pm", rule: "Refunds above $200 need a person", action: "blocked", target: "Tool call: issue_refund", reason: "The refund was $340, which is over the limit an agent may issue alone. A person was asked to approve it.", match: "issue_refund({ amount: 340.00, order: \"A-9914\" })" },
  { id: "3", time: "2:12:10 pm", rule: "Stay on topic", action: "allowed", target: "Draft reply to ticket 4820" },
  { id: "4", time: "2:10:47 pm", rule: "No legal advice", action: "flagged", target: "Draft reply to ticket 4817", reason: "The draft said what the customer is legally entitled to. It was sent for a person to review.", match: "…you are legally entitled to a full refund…" },
  { id: "5", time: "2:09:31 pm", rule: "Stay on topic", action: "allowed", target: "Draft reply to ticket 4815" },
  { id: "6", time: "2:08:02 pm", rule: "No customer emails in replies", action: "allowed", target: "Draft reply to ticket 4812" },
]

export default function GuardrailFeedDemo() {
  return (
    <div className="w-full max-w-2xl">
      <GuardrailFeed events={events} defaultOpenId="2" />
    </div>
  )
}
