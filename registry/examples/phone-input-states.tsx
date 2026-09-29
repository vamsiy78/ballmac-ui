import { PhoneInput } from "@/components/ballmac/phone-input"
export default function PhoneInputStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium">International contact</p>
      <PhoneInput
        label="International contact"
        defaultCountryCode="+44"
        placeholder="National number"
      />
    </div>
  )
}
