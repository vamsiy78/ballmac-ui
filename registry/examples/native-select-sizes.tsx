"use client"

import { NativeSelect, NativeSelectOption } from "@/components/ballmac/native-select"

export default function NativeSelectSizes() {
  return (
    <div className="grid w-full max-w-xs gap-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <NativeSelect key={size} size={size} aria-label={`Plan, ${size}`} defaultValue="team">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="team">Team</NativeSelectOption>
          <NativeSelectOption value="business">Business</NativeSelectOption>
        </NativeSelect>
      ))}
    </div>
  )
}
