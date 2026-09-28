import { Checkbox } from "@/components/ballmac/checkbox"
import { Label } from "@/components/ballmac/label"

export default function CheckboxDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex items-start gap-3">
        <Checkbox id="terms" defaultChecked aria-describedby="terms-description" />
        <div className="grid gap-1.5">
          <Label htmlFor="terms">Accept terms and conditions</Label>
          <p id="terms-description" className="text-sm text-muted-foreground">
            You agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="updates" />
        <Label htmlFor="updates">Email me product updates</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="beta" disabled />
        <Label htmlFor="beta">Join the beta (invite only)</Label>
      </div>
    </div>
  )
}
