"use client"

import { Survey1 } from "@/components/ballmac/blocks/survey-1/survey-1"

export default function Survey1Error() {
  return <Survey1 defaultStep={2} defaultScore={4} state="error" />
}
