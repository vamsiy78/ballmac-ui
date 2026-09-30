"use client"
import * as React from "react"
import { StepperForm } from "@/components/ballmac/stepper-form"
export default function StepperFormStates() {
  const [ready, setReady] = React.useState(false)
  return (
    <StepperForm
      className="w-full max-w-sm"
      steps={[
        {
          id: "invite",
          title: "Invite",
          description: "Send an invitation to a teammate.",
          content: (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ready}
                onChange={(event) => setReady(event.target.checked)}
              />
              I have their permission
            </label>
          ),
          validate: () => ready,
        },
        {
          id: "confirm",
          title: "Confirm",
          content: <p className="text-sm">Ready to send the invite.</p>,
        },
      ]}
    />
  )
}
