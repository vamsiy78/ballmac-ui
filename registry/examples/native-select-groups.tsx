import { Globe } from "lucide-react"

import { NativeSelect, NativeSelectGroup, NativeSelectOption } from "@/components/ballmac/native-select"

export default function NativeSelectGroups() {
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <label htmlFor="tz" className="text-sm font-medium">
        Time zone
      </label>
      <NativeSelect id="tz" startIcon={<Globe />} defaultValue="Europe/Lisbon">
        <NativeSelectGroup label="Europe">
          <NativeSelectOption value="Europe/Lisbon">Lisbon (WET)</NativeSelectOption>
          <NativeSelectOption value="Europe/Helsinki">Helsinki (EET)</NativeSelectOption>
        </NativeSelectGroup>
        <NativeSelectGroup label="Asia">
          <NativeSelectOption value="Asia/Tokyo">Tokyo (JST)</NativeSelectOption>
          <NativeSelectOption value="Asia/Kolkata">Kolkata (IST)</NativeSelectOption>
        </NativeSelectGroup>
        <NativeSelectGroup label="Africa">
          <NativeSelectOption value="Africa/Nairobi">Nairobi (EAT)</NativeSelectOption>
        </NativeSelectGroup>
      </NativeSelect>
    </div>
  )
}
