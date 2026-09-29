import { NumberInput } from "@/components/ballmac/number-input"
export default function NumberInputDemo() {
  return (
    <div className="w-full max-w-xs rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Invite seats</p>
      <p className="mt-1 mb-4 text-xs text-muted-foreground">
        Choose how many teammates can join.
      </p>
      <NumberInput label="Invite seats" defaultValue={3} min={1} max={20} />
    </div>
  )
}
