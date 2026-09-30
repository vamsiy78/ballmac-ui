import { LoadingDots } from "@/components/ballmac/loading-dots"
export default function LoadingDotsDemo() {
  return (
    <div className="bg-card flex w-full max-w-xs items-center justify-between rounded-xl border border-border px-4 py-3">
      <span className="text-sm font-medium">Preparing your workspace</span>
      <LoadingDots label="Preparing workspace" />
    </div>
  )
}
