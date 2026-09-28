"use client"

import { RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"

import { Message, MessageAction, MessageActions, MessageAvatar, MessageContent, MessageCopyAction, MessageTimestamp } from "@/components/ballmac/ai-message"

const reply = "Use `useTransition` to keep the input responsive while the list re-renders; wrap only the expensive state update in `startTransition`."

export default function AiMessageActions() {
  return (
    <div className="w-full max-w-xl">
      <Message role="assistant">
        <MessageAvatar>AI</MessageAvatar>
        <MessageContent>
          <p>
            Use <code>useTransition</code> to keep the input responsive while the list re-renders; wrap only the expensive
            state update in <code>startTransition</code>.
          </p>
        </MessageContent>
        <MessageActions visibility="always">
          <MessageCopyAction value={reply} />
          <MessageAction label="Regenerate">
            <RotateCcw />
          </MessageAction>
          <MessageAction label="Good response">
            <ThumbsUp />
          </MessageAction>
          <MessageAction label="Bad response">
            <ThumbsDown />
          </MessageAction>
          <MessageTimestamp date="2026-09-28T09:41:00Z" timeZone="UTC" />
        </MessageActions>
      </Message>
    </div>
  )
}
