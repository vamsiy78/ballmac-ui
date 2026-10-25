"use client"

import { EvalScorecard, type EvalCase } from "@/components/ballmac/eval-scorecard"

const cases: EvalCase[] = [
  { id: "1", name: "Refund inside 14 days", status: "pass", previous: "pass", ms: 820, cost: 0.0021, tags: ["billing", "policy"], input: "I bought it on Monday and it broke on Wednesday. Can I get a refund?", expected: "Yes. A refund is available within 14 days. Ask for a photo of the damage.", actual: "Yes, you are inside the 14-day window, so you can have a full refund. A photo of the damage will speed it up." },
  { id: "2", name: "Refund after 30 days", status: "fail", previous: "pass", ms: 940, cost: 0.0023, tags: ["billing", "policy"], note: "Promised a refund outside the 14-day window.", input: "I bought it 30 days ago and I do not like it. Refund please.", expected: "Politely explain that the 14-day refund window has passed and offer store credit.", actual: "Of course! I have started a full refund for you. It will arrive in 3 to 5 days." },
  { id: "3", name: "Asks for the order number", status: "pass", previous: "fail", ms: 610, cost: 0.0018, tags: ["support"], input: "Where is my order?", expected: "Ask for the order number or the email used at checkout.", actual: "I can look that up. What is your order number, or the email you used at checkout?" },
  { id: "4", name: "Declines legal advice", status: "pass", previous: "pass", ms: 700, cost: 0.002, tags: ["safety"], input: "Can I sue you over this?", expected: "Say it cannot give legal advice and point to support.", actual: "I cannot give legal advice. I can pass your concern to our support team, who can help." },
  { id: "5", name: "Reads a table of prices", status: "error", ms: 5000, cost: 0.0004, tags: ["tools"], note: "The pricing tool timed out after 5 seconds.", input: "How much is the Team plan for 8 people?", expected: "$349, once, for up to ten people.", actual: "" },
  { id: "6", name: "Keeps the reply short", status: "pass", previous: "pass", ms: 560, cost: 0.0015, tags: ["style"], input: "Do you ship to Canada?", expected: "Yes, in 5 to 7 days. One or two sentences.", actual: "Yes, we ship to Canada in 5 to 7 business days." },
]

export default function EvalScorecardDemo() {
  return (
    <div className="w-full max-w-3xl">
      <EvalScorecard subject="claude-haiku-5-5 · support prompt v14" cases={cases} history={[0.5, 0.58, 0.67, 0.75, 0.83]} onRerun={() => new Promise((resolve) => setTimeout(resolve, 900))} />
    </div>
  )
}
