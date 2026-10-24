import { GuardrailFeed } from "@/components/ballmac/guardrail-feed"

export default function GuardrailFeedQuiet() {
  return (
    <div className="w-full max-w-2xl">
      <GuardrailFeed
        title="Checks on today's replies"
        events={[
          { id: "a", time: "9:02:11 am", rule: "Stay on topic", action: "allowed", target: "Draft reply to ticket 5001" },
          { id: "b", time: "9:04:40 am", rule: "No legal advice", action: "allowed", target: "Draft reply to ticket 5002" },
        ]}
      />
    </div>
  )
}
