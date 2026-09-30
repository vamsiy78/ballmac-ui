import { ThinkingIndicator } from "@/components/ballmac/thinking-indicator"

export default function ThinkingIndicatorDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card px-4 py-3.5">
      <ThinkingIndicator
        variant="shimmer"
        showTimer
        label={["Reading the project files", "Comparing two approaches", "Drafting a reply"]}
      />
    </div>
  )
}
