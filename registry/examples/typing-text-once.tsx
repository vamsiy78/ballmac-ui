import { TypingText } from "@/components/ballmac/typing-text"

export default function TypingTextOnce() {
  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-4 font-mono text-sm shadow-xs">
      <p className="text-muted-foreground">$ pnpm dlx shadcn@latest add</p>
      <TypingText className="text-foreground" text="@ballmac/button @ballmac/card @ballmac/dialog" typingSpeed={40} />
    </div>
  )
}
