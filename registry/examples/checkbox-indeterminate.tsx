"use client"

import * as React from "react"

import { Checkbox } from "@/components/ballmac/checkbox"
import { Label } from "@/components/ballmac/label"

const events = [
  { id: "deploy", label: "Deployment finished" },
  { id: "invoice", label: "Invoice paid" },
  { id: "comment", label: "New comment" },
  { id: "member", label: "Member joined" },
]

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = React.useState<string[]>(["deploy", "comment"])
  const all = selected.length === events.length
  const state = all ? true : selected.length > 0 ? "indeterminate" : false

  return (
    <fieldset className="w-full max-w-xs rounded-xl border bg-card p-4">
      <legend className="sr-only">Notify me about</legend>
      <div className="flex items-center gap-3 border-b pb-3">
        <Checkbox
          id="events-all"
          checked={state}
          onCheckedChange={(checked) => setSelected(checked === true ? events.map((e) => e.id) : [])}
        />
        <Label htmlFor="events-all">All events</Label>
        <span className="ms-auto text-xs text-muted-foreground tabular-nums">
          {selected.length}/{events.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 pt-3 ps-7">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-3">
            <Checkbox
              id={`events-${event.id}`}
              checked={selected.includes(event.id)}
              onCheckedChange={(checked) =>
                setSelected((prev) => (checked === true ? [...prev, event.id] : prev.filter((id) => id !== event.id)))
              }
            />
            <Label htmlFor={`events-${event.id}`} className="font-normal">
              {event.label}
            </Label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
