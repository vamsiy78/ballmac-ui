import { Label } from "@/components/ballmac/label"
import { Switch } from "@/components/ballmac/switch"

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="airplane-mode" defaultChecked />
        <Label htmlFor="airplane-mode">Airplane mode</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="compact" size="sm" />
        <Label htmlFor="compact">Compact view</Label>
      </div>
    </div>
  )
}
