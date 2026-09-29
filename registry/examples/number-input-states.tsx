import { NumberInput } from "@/components/ballmac/number-input"
export default function NumberInputStates() {
  return (
    <div className="w-full max-w-xs">
      <p className="mb-2 text-sm font-medium">Hours per week</p>
      <NumberInput
        label="Hours per week"
        defaultValue={2.5}
        min={0}
        max={40}
        step={0.5}
      />
    </div>
  )
}
