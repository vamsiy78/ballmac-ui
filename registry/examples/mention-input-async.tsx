"use client"

import * as React from "react"

import { MentionInput, type MentionOption, type MentionSource, type MentionValue } from "@/components/ballmac/mention-input"

const directory = [
  { id: "a1", label: "Adaeze Okafor", description: "adaeze@acme.example" },
  { id: "a2", label: "Ben Lindqvist", description: "ben@acme.example" },
  { id: "a3", label: "Chloé Moreau", description: "chloe@acme.example" },
  { id: "a4", label: "Dev Anand", description: "dev@acme.example" },
  { id: "a5", label: "Elif Kaya", description: "elif@acme.example" },
  { id: "a6", label: "Farid Novak", description: "farid@acme.example" },
]

/** Stands in for a request to your people search. It answers after a short wait and stops if the person types on. */
function searchPeople(query: string, signal: AbortSignal): Promise<MentionOption[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(directory.filter((p) => p.label.toLowerCase().includes(query.trim().toLowerCase()))), 450)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

const sources: MentionSource[] = [{ trigger: "@", label: "People", options: searchPeople }]

export default function MentionInputAsync() {
  const [value, setValue] = React.useState<MentionValue>({ text: "", mentions: [] })
  return <MentionInput aria-label="Reply" placeholder="Reply to the thread. Type @ to find a teammate." sources={sources} value={value} onValueChange={setValue} className="w-full max-w-md" />
}
