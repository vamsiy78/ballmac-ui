import { Spinner } from "@/components/ballmac/spinner"
export default function SpinnerDemo() {
  return (
    <div className="flex w-full max-w-xs items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <div className="text-sm font-semibold">Saving changes</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Your workspace will update shortly.
        </div>
      </div>
      <Spinner size="lg" label="Saving changes" className="text-primary" />
    </div>
  )
}
