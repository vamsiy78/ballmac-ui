// Ballmac UI: Password Input. https://ui.ballmac.com/components/password-input
"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  /** Controlled password value. */
  value?: string
  /** Initial password when uncontrolled. */
  defaultValue?: string
  /** Called with the new password. */
  onValueChange?: (value: string) => void
  /** Show a four-step strength guide. */
  showStrength?: boolean
  /** Accessible name of the password field. */
  label?: string
}
function PasswordInput({
  value,
  defaultValue = "",
  onValueChange,
  showStrength = true,
  label = "Password",
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [visible, setVisible] = React.useState(false)
  const current = value ?? internal
  const score =
    Number(current.length >= 8) +
    Number(/[a-z]/.test(current) && /[A-Z]/.test(current)) +
    Number(/\d/.test(current)) +
    Number(/[^a-zA-Z\d]/.test(current))
  const strength = ["Too short", "Needs work", "Fair", "Good", "Strong"][score]
  function commit(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  return (
    <div data-slot="password-input" className={cn("w-full min-w-0", className)}>
      <div className="flex h-9 items-center rounded-md border border-input bg-background shadow-xs transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        <input
          data-slot="password-input-field"
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          aria-label={label}
          disabled={disabled}
          value={current}
          onChange={(event) => commit(event.currentTarget.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible(!visible)}
          className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      {showStrength && current.length > 0 && (
        <div data-slot="password-strength" className="mt-2" aria-live="polite">
          <div aria-hidden="true" className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={cn(
                  "h-1 rounded-full bg-muted",
                  score >= level &&
                    (score < 3 ? "bg-destructive" : "bg-chart-2"),
                )}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Strength: {strength}. Use 8+ characters, mixed case, a number, and a
            symbol.
          </p>
        </div>
      )}
    </div>
  )
}
export { PasswordInput, type PasswordInputProps }
