import { MultiSelect } from "@/components/ballmac/multi-select"
const options = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "support", label: "Support" },
]
export default function MultiSelectDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 text-sm font-semibold">Share weekly summary</div>
      <label className="mb-1.5 block text-xs text-muted-foreground">
        Teams with access
      </label>
      <MultiSelect
        options={options}
        defaultValue={["design", "product"]}
        label="Teams with access"
        maxSelected={3}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Choose up to three teams.
      </p>
    </div>
  )
}
