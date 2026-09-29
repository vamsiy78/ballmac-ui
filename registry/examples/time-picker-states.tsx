import { TimePicker } from "@/components/ballmac/time-picker"
export default function TimePickerStates() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-sm font-medium">Office hours end</p>
      <TimePicker
        label="Office hours end"
        defaultValue="17:30"
        min="09:00"
        max="20:00"
      />
    </div>
  )
}
