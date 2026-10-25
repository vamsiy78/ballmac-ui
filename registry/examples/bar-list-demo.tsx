"use client"

import * as React from "react"
import { FileText } from "lucide-react"

import { BarList } from "@/components/ballmac/bar-list"

const pages = [
  { id: "1", label: "/pricing", value: 12840, hint: "+8%", href: "#pricing" },
  { id: "2", label: "/docs/getting-started", value: 9310, hint: "+3%", href: "#docs" },
  { id: "3", label: "/blog/launch-week", value: 7420, hint: "+41%", href: "#blog" },
  { id: "4", label: "/components/data-table", value: 5180, hint: "-2%", href: "#table" },
  { id: "5", label: "/changelog", value: 3960, hint: "+1%", href: "#changelog" },
  { id: "6", label: "/about", value: 1210, hint: "-9%", href: "#about" },
  { id: "7", label: "/contact", value: 640, hint: "0%", href: "#contact" },
]

export default function BarListDemo() {
  return (
    <div className="w-full max-w-md">
      <BarList title="Top pages this week" items={pages.map((p) => ({ ...p, icon: <FileText className="text-muted-foreground" /> }))} limit={5} showShare />
    </div>
  )
}
