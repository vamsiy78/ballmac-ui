// Ballmac UI: Phone Input. https://ui.ballmac.com/components/phone-input
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type PhoneCountry = { code: string; label: string }
type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  /** National number, controlled by the parent. Formatting is preserved. */
  value?: string
  /** Initial national number when uncontrolled. */
  defaultValue?: string
  /** Called with the edited national number. */
  onValueChange?: (value: string) => void
  /** Controlled international dialing prefix. */
  countryCode?: string
  /** Initial dialing prefix when uncontrolled. */
  defaultCountryCode?: string
  /** Called when the dialing prefix changes. */
  onCountryCodeChange?: (code: string) => void
  /** Dialing prefixes available in the menu. */
  countries?: PhoneCountry[]
  /** Accessible name of the number field. */
  label?: string
  /** Name of the separate country-code form field. */
  countryCodeName?: string
}
const defaultCountries: PhoneCountry[] = [
  { code: "+1", label: "+1 United States" },
  { code: "+44", label: "+44 United Kingdom" },
  { code: "+91", label: "+91 India" },
  { code: "+49", label: "+49 Germany" },
  { code: "+61", label: "+61 Australia" },
]
function PhoneInput({
  value,
  defaultValue = "",
  onValueChange,
  countryCode,
  defaultCountryCode = "+1",
  onCountryCodeChange,
  countries = defaultCountries,
  label = "Phone number",
  countryCodeName,
  className,
  disabled,
  ...props
}: PhoneInputProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [internalCode, setInternalCode] = React.useState(defaultCountryCode)
  const current = value ?? internal
  const code = countryCode ?? internalCode
  return (
    <div
      data-slot="phone-input"
      className={cn(
        "flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-background shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      <select
        data-slot="phone-input-country"
        aria-label="Country dialing code"
        name={countryCodeName}
        disabled={disabled}
        value={code}
        onChange={(event) => {
          if (countryCode === undefined) setInternalCode(event.target.value)
          onCountryCodeChange?.(event.target.value)
        }}
        className="h-full max-w-24 shrink-0 rounded-l-md border-r border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.label}
          </option>
        ))}
      </select>
      <input
        data-slot="phone-input-field"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-label={label}
        disabled={disabled}
        value={current}
        onChange={(event) => {
          if (value === undefined) setInternal(event.currentTarget.value)
          onValueChange?.(event.currentTarget.value)
        }}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        {...props}
      />
    </div>
  )
}
export { PhoneInput, type PhoneInputProps, type PhoneCountry }
