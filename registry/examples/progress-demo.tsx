import { Progress } from "@/components/ballmac/progress"
export default function ProgressDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold">Importing your files</span>
        <span className="text-muted-foreground">Step 3 of 4</span>
      </div>
      <p className="mt-1 mb-5 text-xs text-muted-foreground">
        Organizing 48 documents into your workspace
      </p>
      <Progress value={68} showValue aria-label="Import progress" />
    </div>
  )
}
