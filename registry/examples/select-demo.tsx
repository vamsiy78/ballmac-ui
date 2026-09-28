import { Label } from "@/components/ballmac/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ballmac/select"

export default function SelectDemo() {
  return (
    <div className="grid w-full max-w-xs gap-2">
      <Label htmlFor="role">Role</Label>
      <Select defaultValue="editor">
        <SelectTrigger id="role" className="w-full">
          <SelectValue placeholder="Choose a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="billing" disabled>
            Billing (upgrade to add)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
