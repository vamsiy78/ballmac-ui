import { DateRangePicker } from "@/components/ballmac/date-range-picker"
export default function DateRangePickerStates() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <DateRangePicker
        label="Booking dates"
        min="2026-10-01"
        max="2026-12-31"
        defaultValue={{ from: "2026-10-12", to: "2026-10-16" }}
      />
      <DateRangePicker
        label="Disabled period"
        defaultValue={{ from: "2026-09-01", to: "2026-09-30" }}
        disabled
      />
    </div>
  )
}
