import { PhoneInput } from "@/components/ballmac/phone-input"
export default function PhoneInputDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Contact number</p>
      <p className="mt-1 mb-4 text-xs text-muted-foreground">
        We will only use this for account recovery.
      </p>
      <PhoneInput
        label="Contact number"
        defaultCountryCode="+91"
        placeholder="Your phone number"
      />
    </div>
  )
}
