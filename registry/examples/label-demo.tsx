import { Input } from "@/components/ballmac/input"
import { Label } from "@/components/ballmac/label"

export default function LabelDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="display-name">Display name</Label>
      <Input id="display-name" placeholder="Alex Morgan" autoComplete="name" />
    </div>
  )
}
