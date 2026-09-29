import { PasswordInput } from "@/components/ballmac/password-input"
export default function PasswordInputDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="mb-1 text-sm font-semibold">Set a workspace password</p>
      <p className="mb-4 text-xs text-muted-foreground">
        The guide updates as you type.
      </p>
      <PasswordInput label="Workspace password" defaultValue="Orbit2026!" />
    </div>
  )
}
