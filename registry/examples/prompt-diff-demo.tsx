import { PromptDiff } from "@/components/ballmac/prompt-diff"

const before = `You are a support assistant for {{company}}. Answer questions about orders and refunds. Be friendly and keep answers short. If you do not know the answer, say so. Never promise a refund.`
const after = `You are a support assistant for {{company}}. Answer questions about orders, shipping and refunds. Be friendly and keep answers under {{max_words}} words. If you do not know the answer, say so and offer to pass the conversation to a person. Never promise a refund before checking the policy.`

export default function PromptDiffDemo() {
  return (
    <div className="w-full max-w-4xl">
      <PromptDiff before={before} after={after} beforeLabel="v12 · 3 Oct" afterLabel="v13 · today" />
    </div>
  )
}
