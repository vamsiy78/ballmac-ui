"use client"

import { Poll1 } from "@/components/ballmac/blocks/poll-1/poll-1"

export default function Poll1Multiple() {
  return <Poll1 multiple maxChoices={2} question="Which two would help you most?" />
}
