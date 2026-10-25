"use client"

import { CitedAnswer } from "@/components/ballmac/cited-answer"

export default function CitedAnswerSingle() {
  return (
    <div className="w-full max-w-2xl">
      <CitedAnswer
        showCoverage={false}
        sources={[{ title: "Plans and pricing", site: "acme.com", url: "https://acme.com/pricing", snippet: "The Team plan includes up to ten people for $349, once." }]}
        paragraphs={["The Team plan covers up to ten people for a single payment of $349 [1]."]}
      />
    </div>
  )
}
