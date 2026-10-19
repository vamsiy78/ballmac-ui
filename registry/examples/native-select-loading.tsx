import * as React from "react"

import { NativeSelect, NativeSelectOption } from "@/components/ballmac/native-select"

/** The options arrive after a moment; the field shows a spinner and says it is busy, and can still be opened. */
export default function NativeSelectLoading() {
  const [cities, setCities] = React.useState<string[] | null>(null)
  React.useEffect(() => {
    const t = setTimeout(() => setCities(["Lisbon", "Osaka", "Nairobi", "Toronto"]), 2500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <label htmlFor="city" className="text-sm font-medium">
        City
      </label>
      <NativeSelect id="city" loading={cities === null} placeholder={cities ? "Choose a city" : "Loading cities"} defaultValue="">
        {cities?.map((c) => (
          <NativeSelectOption key={c} value={c}>
            {c}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
