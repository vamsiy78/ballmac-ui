"use client"
import * as React from "react"
import { StepperForm } from "@/components/ballmac/stepper-form"
export default function StepperFormDemo() {
  const [name, setName] = React.useState("Product design")
  const [size, setSize] = React.useState("5–20 people")
  const [done, setDone] = React.useState(false)
  const steps = [
    {
      id: "details",
      title: "Details",
      description: "Name your workspace.",
      content: (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Workspace name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </label>
      ),
      validate: () => name.trim().length > 0,
    },
    {
      id: "team",
      title: "Team",
      description: "Choose your team size.",
      content: (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Team size
          <select
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            <option>1–5 people</option>
            <option>5–20 people</option>
            <option>20+ people</option>
          </select>
        </label>
      ),
    },
    {
      id: "review",
      title: "Review",
      description: "Check the details before creating.",
      content: (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p>{name}</p>
          <p className="text-muted-foreground mt-1 text-xs">{size}</p>
        </div>
      ),
    },
  ]
  return done ? (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-sm">
      Workspace is ready.
    </div>
  ) : (
    <StepperForm
      className="w-full max-w-sm"
      steps={steps}
      onComplete={() => setDone(true)}
      completeLabel="Create workspace"
    />
  )
}
