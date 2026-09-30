import { CurrencyInput } from "@/components/ballmac/currency-input"
export default function CurrencyInputDemo() {
  return (
    <div className="w-full max-w-xs rounded-xl border border-border bg-card p-5">
      <p className="mb-4 text-sm font-semibold">Project budget</p>
      <CurrencyInput
        label="Monthly budget"
        currency="USD"
        defaultValue={4250.5}
        min={0}
      />
      <p className="text-muted-foreground mt-3 text-xs">
        Formatted for your locale; edit as a number.
      </p>
    </div>
  )
}
