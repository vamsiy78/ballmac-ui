"use client"

import { CitedAnswer } from "@/components/ballmac/cited-answer"

const sources = [
  { title: "Refund policy", site: "help.acme.com", url: "https://help.acme.com/refunds", date: "Updated Oct 2", snippet: "If an item does not work as described and we cannot fix it within 14 days of your request, you receive a full refund to the original payment method." },
  { title: "Shipping and returns FAQ", site: "acme.com", url: "https://acme.com/faq/returns", date: "Sep 18", snippet: "Return shipping is free for damaged items. Send a photo with your request and we will email a prepaid label within one business day." },
  { title: "Store credit terms", site: "help.acme.com", url: "https://help.acme.com/credit", date: "Aug 30", snippet: "Store credit never expires and can be used on any order. It can be converted back to the original payment method on request." },
]

export default function CitedAnswerDemo() {
  return (
    <div className="w-full max-w-3xl">
      <CitedAnswer
        question="Can I get my money back for the damaged speaker?"
        sources={sources}
        paragraphs={[
          "Yes. Because the speaker arrived damaged, you are covered by the 14-day refund policy [1], and return shipping is free [2].",
          "Send a photo with your request and a prepaid label arrives within one business day [2]. You can take the refund to your card, or keep it as store credit that never expires [1, 3]. I would start with the photo, since it is the quickest step.",
        ]}
      />
    </div>
  )
}
