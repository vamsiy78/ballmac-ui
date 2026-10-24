"use client"

import { MessageActions } from "@/components/ballmac/message-actions"

const answer = "Your refund of $340 was issued on 14 October and returned by the bank because the card had expired. I have re-issued it as store credit, which is in your account now."

export default function MessageActionsDemo() {
  return (
    <div className="grid w-full max-w-lg gap-2">
      <div className="flex gap-3">
        <span aria-hidden="true" className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">A</span>
        <div className="grid gap-2">
          <p className="rounded-2xl rounded-ss-md bg-muted px-4 py-2.5 text-sm leading-relaxed">{answer}</p>
          <MessageActions
            text={answer}
            onRegenerate={() => new Promise((resolve) => setTimeout(resolve, 900))}
            onFeedback={() => new Promise((resolve) => setTimeout(resolve, 400))}
            onBranch={() => new Promise((resolve) => setTimeout(resolve, 300))}
            onShare={() => new Promise((resolve) => setTimeout(resolve, 300))}
          />
        </div>
      </div>
    </div>
  )
}
