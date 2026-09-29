import { ColorPicker } from "@/components/ballmac/color-picker"
export default function ColorPickerStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium">Annotation color</p>
      <ColorPicker label="Annotation color" defaultValue="#2f9e78" />
    </div>
  )
}
