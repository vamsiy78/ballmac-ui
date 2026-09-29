import { MultiSelect } from "@/components/ballmac/multi-select"
const options = [
  { value: "ready", label: "Ready" },
  { value: "review", label: "Needs review" },
  { value: "paused", label: "Paused", disabled: true },
  { value: "done", label: "Completed" },
]
export default function MultiSelectStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium">Filter by status</p>
      <MultiSelect
        options={options}
        label="Filter by status"
        placeholder="All statuses"
      />
    </div>
  )
}
