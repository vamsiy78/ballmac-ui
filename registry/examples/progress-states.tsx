import { Progress } from "@/components/ballmac/progress"
export default function ProgressStates() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="text-sm font-medium">Almost there</div>
      <Progress value={91} showValue aria-label="Upload progress" />
      <div className="text-sm font-medium">Waiting for a response</div>
      <Progress value={null} showValue aria-label="Connection progress" />
    </div>
  )
}
