import { DateRangePicker } from "@/components/ballmac/date-range-picker"
export default function DateRangePickerDemo() {
  return (
    <DateRangePicker
      className="w-full max-w-sm"
      label="Report period"
      defaultValue={{ from: "2026-09-01", to: "2026-09-30" }}
      presets={[
        { label: "This week", from: "2026-09-28", to: "2026-10-04" },
        { label: "This month", from: "2026-09-01", to: "2026-09-30" },
        { label: "Last month", from: "2026-08-01", to: "2026-08-31" },
      ]}
    />
  )
}
