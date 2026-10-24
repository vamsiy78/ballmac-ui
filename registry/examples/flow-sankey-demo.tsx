"use client"

import { FlowSankey } from "@/components/ballmac/flow-sankey"

const nodes = [
  { id: "ads", label: "Ads", group: "Source" },
  { id: "search", label: "Search", group: "Source" },
  { id: "social", label: "Social", group: "Source" },
  { id: "home", label: "Home page", group: "Visit" },
  { id: "pricing", label: "Pricing", group: "Visit" },
  { id: "docs", label: "Docs", group: "Visit" },
  { id: "signup", label: "Signed up", group: "Result" },
  { id: "left", label: "Left", group: "Drop" },
]
const links = [
  { source: "ads", target: "home", value: 4200 },
  { source: "ads", target: "pricing", value: 1800 },
  { source: "search", target: "home", value: 3100 },
  { source: "search", target: "docs", value: 2600 },
  { source: "social", target: "home", value: 1900 },
  { source: "social", target: "docs", value: 700 },
  { source: "home", target: "signup", value: 1500 },
  { source: "home", target: "pricing", value: 2300 },
  { source: "home", target: "left", value: 5400 },
  { source: "pricing", target: "signup", value: 1900 },
  { source: "pricing", target: "left", value: 2200 },
  { source: "docs", target: "signup", value: 900 },
  { source: "docs", target: "left", value: 2400 },
]

export default function FlowSankeyDemo() {
  return (
    <div className="w-full max-w-4xl">
      <FlowSankey nodes={nodes} links={links} defaultSelected="pricing" />
    </div>
  )
}
