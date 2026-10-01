import { TypingText } from "@/components/ballmac/typing-text"

export default function TypingTextDemo() {
  return (
    <p className="max-w-lg text-center text-3xl font-semibold tracking-tight text-foreground">
      Build a <TypingText text={["landing page", "dashboard", "design system", "mobile app"]} />
    </p>
  )
}
