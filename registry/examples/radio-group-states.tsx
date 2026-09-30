import { RadioGroup, RadioGroupItem } from "@/components/ballmac/radio-group";
export default function RadioGroupStates() {
  return (
    <div className="w-full max-w-xs">
      <p className="mb-3 text-sm font-medium">Export format</p>
      <RadioGroup aria-label="Export format" defaultValue="pdf">
        {[
          { value: "pdf", label: "PDF document" },
          { value: "csv", label: "CSV spreadsheet" },
          { value: "json", label: "JSON data" },
        ].map((option) => (
          <label
            key={option.value}
            className="flex min-h-9 items-center gap-3 text-sm"
          >
            <RadioGroupItem value={option.value} />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
