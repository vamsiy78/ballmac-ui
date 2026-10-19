import { NativeSelect, NativeSelectOption } from "@/components/ballmac/native-select"

export default function NativeSelectDemo() {
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <label htmlFor="country" className="text-sm font-medium">
        Country
      </label>
      <NativeSelect id="country" name="country" placeholder="Choose a country" defaultValue="">
        <NativeSelectOption value="pt">Portugal</NativeSelectOption>
        <NativeSelectOption value="jp">Japan</NativeSelectOption>
        <NativeSelectOption value="ke">Kenya</NativeSelectOption>
        <NativeSelectOption value="ca">Canada</NativeSelectOption>
        <NativeSelectOption value="fi">Finland</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}
