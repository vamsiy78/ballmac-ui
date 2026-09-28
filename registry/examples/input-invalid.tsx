import { Input } from "@/components/ballmac/input"
import { Label } from "@/components/ballmac/label"

export default function InputInvalid() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="invalid-email">Work email</Label>
      <Input
        id="invalid-email"
        type="email"
        defaultValue="alex@acme"
        aria-invalid="true"
        aria-describedby="invalid-email-error"
      />
      <p id="invalid-email-error" className="text-sm text-destructive">
        Enter a full email address, like alex@acme.com.
      </p>
    </div>
  )
}
