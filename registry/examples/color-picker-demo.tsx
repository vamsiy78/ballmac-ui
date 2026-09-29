import { ColorPicker } from "@/components/ballmac/color-picker"
export default function ColorPickerDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="mb-1 text-sm font-semibold">Workspace accent</p>
      <p className="mb-4 text-xs text-muted-foreground">
        Use a color that feels like your team.
      </p>
      <ColorPicker label="Workspace accent" defaultValue="#6d5ef7" />
    </div>
  )
}
