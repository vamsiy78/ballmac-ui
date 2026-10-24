"use client"

import * as React from "react"
import { CreditCard, FileText, Mail, Search, Table2, Trash2 } from "lucide-react"

import { AutonomyDial, type AutonomyAction, type AutonomyLevel } from "@/components/ballmac/autonomy-dial"

const levels: AutonomyLevel[] = [
  { value: "ask", label: "Always ask", summary: "Reads and searches on its own, and asks before it changes anything.", does: [], asks: [] },
  { value: "risky", label: "Ask if risky", summary: "Does the safe things alone and stops for anything that sends, spends or changes a record.", does: [], asks: [] },
  { value: "auto", label: "Full auto", summary: "Does everything inside its budget, and still asks for what cannot be undone.", does: [], asks: [] },
]

const actions: AutonomyAction[] = [
  { id: "search", label: "Search the web", icon: <Search />, risk: "safe", autoFrom: "ask" },
  { id: "read", label: "Read files and docs", icon: <FileText />, risk: "safe", autoFrom: "ask" },
  { id: "draft", label: "Draft emails", icon: <Mail />, risk: "safe", autoFrom: "risky" },
  { id: "crm", label: "Update CRM records", icon: <Table2 />, risk: "risky", autoFrom: "auto" },
  { id: "send", label: "Send emails", icon: <Mail />, risk: "risky", autoFrom: "auto" },
  { id: "pay", label: "Make payments", icon: <CreditCard />, risk: "destructive" },
  { id: "delete", label: "Delete files", icon: <Trash2 />, risk: "destructive" },
]

export default function AutonomyDialDemo() {
  const [value, setValue] = React.useState("risky")
  return (
    <div className="w-full max-w-2xl">
      <AutonomyDial levels={levels} actions={actions} value={value} onValueChange={setValue} label="What may the sales agent do without asking?" />
    </div>
  )
}
