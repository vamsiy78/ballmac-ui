import { Skeleton } from "@/components/ballmac/skeleton"
export default function SkeletonDemo() {
  return (
    <div
      role="status"
      aria-label="Loading project summary"
      className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
      <Skeleton className="mt-6 h-24 w-full rounded-lg" />
      <span className="sr-only">Loading project summary</span>
    </div>
  )
}
