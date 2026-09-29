import { Spinner } from "@/components/ballmac/spinner"
export default function SpinnerStates() {
  return (
    <div className="flex items-center gap-6 text-primary">
      <Spinner size="sm" label="Loading small item" />
      <Spinner label="Loading item" />
      <Spinner size="lg" label="Loading large item" />
    </div>
  )
}
