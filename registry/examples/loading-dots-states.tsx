import { LoadingDots } from "@/components/ballmac/loading-dots"
export default function LoadingDotsStates() {
  return (
    <div className="bg-card flex w-full max-w-xs items-end justify-around rounded-xl border border-border p-5">
      <LoadingDots size="sm" label="Loading small example" />
      <LoadingDots label="Loading standard example" />
      <LoadingDots size="lg" label="Loading large example" />
    </div>
  )
}
