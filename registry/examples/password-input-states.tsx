import { PasswordInput } from "@/components/ballmac/password-input"
export default function PasswordInputStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium">Confirm your password</p>
      <PasswordInput
        label="Confirm password"
        showStrength={false}
        placeholder="Enter password"
      />
    </div>
  )
}
