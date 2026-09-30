import { ProgressSteps } from "@/components/ballmac/progress-steps"
export default function ProgressStepsStates() {
  return (
    <ProgressSteps
      className="w-full max-w-xs"
      label="Publishing progress"
      steps={[
        { id: "draft", label: "Draft" },
        { id: "review", label: "Review" },
        { id: "publish", label: "Publish" },
      ]}
      activeIndex={2}
    />
  )
}
