"use client"

import { CaseStudy1, type CaseStudy1Story } from "@/components/ballmac/blocks/casestudy-1/casestudy-1"

const stories: CaseStudy1Story[] = [
  {
    id: "harbor",
    company: "Harbor Bank",
    industry: "Finance",
    headline: "Harbor Bank closed its books two days sooner every month",
    summary: "Approvals that took email chains now take a click, with a record of who agreed to what.",
    quote: "Our auditors asked how we did it. We showed them the history and they stopped asking.",
    person: { name: "Daniel Okoro", role: "Controller" },
    metrics: [{ value: 2, label: "days faster close" }, { value: 96, suffix: "%", label: "approved on first pass" }, { value: 0, label: "audit findings" }],
    href: "#",
  },
]

export default function CaseStudy1Rings() {
  return <CaseStudy1 art="rings" stories={stories} title="One result worth a page" description="A single story, told with the numbers that mattered." />
}
