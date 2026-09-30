import { CurrencyInput } from "@/components/ballmac/currency-input"
export default function CurrencyInputStates() {
  return (
    <div className="grid w-full max-w-xs gap-4">
      <CurrencyInput
        label="Budget in euros"
        currency="EUR"
        locale="de-DE"
        defaultValue={1250.5}
      />
      <CurrencyInput
        label="Budget in yen"
        currency="JPY"
        locale="ja-JP"
        defaultValue={50000}
      />
    </div>
  )
}
