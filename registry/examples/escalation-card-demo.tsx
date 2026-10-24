"use client"

import { EscalationCard } from "@/components/ballmac/escalation-card"

export default function EscalationCardDemo() {
  return (
    <div className="w-full max-w-xl">
      <EscalationCard
        customer="Maria Lopez"
        channel="Chat · Help centre"
        sentiment="frustrated"
        waiting="4 min"
        waitedMinutes={4}
        slaMinutes={5}
        reason="The refund is over the amount an agent may approve alone, and the customer asked to speak to a person."
        summary={["Order A-9914, paid by card on 12 October", "Item arrived damaged; photos were sent", "Refund of $340 requested, policy allows it"]}
        messages={[
          { from: "customer", text: "This is the second time it has arrived broken. I want my money back, not another replacement.", time: "2:09 pm" },
          { from: "agent", text: "I am sorry about that. I can see the photos. Let me check what I can do for you.", time: "2:10 pm" },
          { from: "customer", text: "Please just get someone who can actually approve it.", time: "2:11 pm" },
        ]}
        suggestedReply={"Hi Maria, I am sorry this has happened twice. I have checked the photos and I am approving a full refund of $340 to your card now. It usually takes 3 to 5 working days to show."}
        onTakeOver={() => new Promise((r) => setTimeout(r, 500))}
        onSnooze={() => new Promise((r) => setTimeout(r, 400))}
        onSendReply={() => new Promise((r) => setTimeout(r, 500))}
      />
    </div>
  )
}
