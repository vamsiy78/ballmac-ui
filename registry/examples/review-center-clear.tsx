"use client"

import { ReviewCenter } from "@/components/ballmac/review-center"

export default function ReviewCenterClear() {
  return (
    <div className="w-full max-w-4xl">
      <ReviewCenter
        title="Review desk"
        items={[
          { id: "1", title: "Release notes for version 2.4", agent: "Writer agent", summary: "Eight changes grouped into New, Improved and Fixed.", status: "approved", confidence: 0.91 },
          { id: "2", title: "Reply to the press enquiry", agent: "Support agent", summary: "A short holding reply.", status: "changes", feedback: "Name the date we will answer by.", confidence: 0.77 },
        ]}
      />
    </div>
  )
}
