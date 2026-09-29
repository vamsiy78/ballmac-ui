import { Skeleton } from "@/components/ballmac/skeleton"
export default function SkeletonStates() {
  return (
    <div
      role="status"
      aria-label="Loading list"
      className="flex w-full max-w-sm flex-col gap-3"
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3 flex-1" />
        </div>
      ))}
      <span className="sr-only">Loading list</span>
    </div>
  )
}
