"use client"

import { WritingAssistant } from "@/components/ballmac/writing-assistant"

export default function WritingAssistantClean() {
  return (
    <div className="w-full max-w-4xl">
      <WritingAssistant defaultText="Hi Maria, your refund of $340 is on its way. It usually takes three to five working days to show on your card." suggestions={[]} />
    </div>
  )
}
