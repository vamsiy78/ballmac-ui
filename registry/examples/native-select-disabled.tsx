import { NativeSelect, NativeSelectOption } from "@/components/ballmac/native-select"

export default function NativeSelectDisabled() {
  return (
    <div className="grid w-full max-w-xs gap-3">
      <NativeSelect aria-label="Billing period, disabled" disabled defaultValue="yearly">
        <NativeSelectOption value="monthly">Monthly</NativeSelectOption>
        <NativeSelectOption value="yearly">Yearly</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Currency, invalid" aria-invalid="true" defaultValue="">
        <NativeSelectOption value="" disabled>
          Choose a currency
        </NativeSelectOption>
        <NativeSelectOption value="usd">US dollar</NativeSelectOption>
        <NativeSelectOption value="eur">Euro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Languages" multiple rows={3} defaultValue={["en", "pt"]}>
        <NativeSelectOption value="en">English</NativeSelectOption>
        <NativeSelectOption value="pt">Portuguese</NativeSelectOption>
        <NativeSelectOption value="ja">Japanese</NativeSelectOption>
        <NativeSelectOption value="sw">Swahili</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}
