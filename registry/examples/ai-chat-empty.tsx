"use client"

import { Sparkles } from "lucide-react"

import { Chat, ChatEmpty, ChatSuggestion, ChatSuggestions } from "@/components/ballmac/ai-chat"

export default function AiChatEmpty() {
  return (
    <div className="h-[360px] w-full max-w-2xl overflow-hidden rounded-xl border bg-background">
      <Chat>
        <ChatEmpty icon={<Sparkles />} title="How can I help?" description="Ask about your code, docs or data.">
          <ChatSuggestions onSelect={() => {}}>
            <ChatSuggestion>Summarize this pull request</ChatSuggestion>
            <ChatSuggestion>Write tests for the checkout flow</ChatSuggestion>
            <ChatSuggestion>Explain this error</ChatSuggestion>
          </ChatSuggestions>
        </ChatEmpty>
      </Chat>
    </div>
  )
}
