import { TimePicker } from "@/components/ballmac/time-picker"
const presets = [
  { label: "Morning", value: "09:00" },
  { label: "Midday", value: "12:00" },
  { label: "Afternoon", value: "15:00" },
]
export default function TimePickerDemo() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <p className="mb-1 text-sm font-semibold">Schedule a reminder</p>
      <p className="mb-4 text-xs text-muted-foreground">
        Pick a time that works for your day.
      </p>
      <TimePicker
        label="Reminder time"
        defaultValue="09:00"
        presets={presets}
      />
    </div>
  )
}
