import { ProgressSteps } from "@/components/ballmac/progress-steps"
const steps = [
  {
    id: "details",
    label: "Workspace details",
    description: "Name and purpose",
  },
  { id: "team", label: "Invite your team", description: "Add collaborators" },
  { id: "finish", label: "Review and launch", description: "Final check" },
]
export default function ProgressStepsDemo() {
  return (
    <ProgressSteps
      className="w-full max-w-xs"
      label="Workspace setup"
      steps={steps}
      defaultActiveIndex={1}
      navigable
    />
  )
}
