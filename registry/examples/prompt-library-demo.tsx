"use client"

import { PromptLibrary, type LibraryPrompt } from "@/components/ballmac/prompt-library"

const prompts: LibraryPrompt[] = [
  { id: "1", title: "Reply to an upset customer", description: "A calm reply that owns the problem and says what happens next.", body: "Write a {{tone}} reply to {{customer_name}} about {{issue}}. Own the problem, say what we will do and by when, and keep it under 120 words.", tags: ["support"], favourite: true },
  { id: "2", title: "Summarise a long thread", description: "Decisions, open questions and who owns what.", body: "Summarise the thread below in {{count}} bullet points. List the decisions, the open questions and who owns each next step.", tags: ["summaries"] },
  { id: "3", title: "Turn notes into release notes", description: "Grouped by New, Improved and Fixed.", body: "Turn these notes into release notes for version {{version}}, grouped under New, Improved and Fixed. Write for customers, not engineers.", tags: ["writing"] },
  { id: "4", title: "Explain it in plain English", body: "Rewrite the text below so a new customer can follow it. No jargon, short sentences.", tags: ["writing", "support"] },
  { id: "5", title: "Draft a polite no", description: "Declines a request and keeps the door open.", body: "Draft a polite email to {{customer_name}} declining {{request}}. Give one clear reason and suggest {{alternative}} instead.", tags: ["support"] },
]

export default function PromptLibraryDemo() {
  return (
    <div className="w-full max-w-4xl">
      <PromptLibrary prompts={prompts} title="Team prompts" onInsert={() => new Promise((resolve) => setTimeout(resolve, 400))} onFavourite={() => new Promise((resolve) => setTimeout(resolve, 250))} />
    </div>
  )
}
