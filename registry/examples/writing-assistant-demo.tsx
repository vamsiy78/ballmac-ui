"use client"

import { WritingAssistant, type WritingSuggestion } from "@/components/ballmac/writing-assistant"

const text = "Hi Maria, I wanted to reach out because we was thinking that it is very important to basically get the refund sorted out for you as soon as possible. Our team have looked at your order and it seems like the item arrived damaged, which we are really really sorry about."

const suggestions: WritingSuggestion[] = [
  { id: "1", find: "we was", replace: "we were", kind: "grammar", reason: "The subject and the verb do not agree." },
  { id: "2", find: "it is very important to basically get the refund sorted out for you as soon as possible", replace: "we will sort out your refund today", kind: "clarity", reason: "Says what will happen, and when, in fewer words." },
  { id: "3", find: "Our team have looked", replace: "Our team has looked", kind: "grammar", reason: "Team is singular here." },
  { id: "4", find: "it seems like the item arrived damaged", replace: "your item arrived damaged", kind: "tone", reason: "You have seen the photos. Say it plainly instead of hedging." },
  { id: "5", find: "really really sorry", replace: "sorry", kind: "length", reason: "One clear apology lands better than two." },
]

export default function WritingAssistantDemo() {
  return (
    <div className="w-full max-w-4xl">
      <WritingAssistant defaultText={text} suggestions={suggestions} />
    </div>
  )
}
