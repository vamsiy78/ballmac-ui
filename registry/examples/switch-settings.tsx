import { Label } from "@/components/ballmac/label"
import { Switch } from "@/components/ballmac/switch"

const settings = [
  { id: "email-digest", label: "Weekly digest", description: "A summary of activity every Monday.", on: true },
  { id: "mentions", label: "Mentions", description: "Notify me when someone @mentions me.", on: true },
  { id: "marketing", label: "Product news", description: "Occasional emails about new features.", on: false },
]

export default function SwitchSettings() {
  return (
    <div className="w-full max-w-md divide-y rounded-xl border bg-card">
      {settings.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-4 p-4">
          <div className="grid gap-1">
            <Label htmlFor={s.id}>{s.label}</Label>
            <p id={`${s.id}-description`} className="text-sm text-muted-foreground">
              {s.description}
            </p>
          </div>
          <Switch id={s.id} defaultChecked={s.on} aria-describedby={`${s.id}-description`} />
        </div>
      ))}
    </div>
  )
}
