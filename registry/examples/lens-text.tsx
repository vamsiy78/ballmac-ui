import { Lens } from "@/components/ballmac/lens"

export default function LensText() {
  return (
    <Lens zoom={2} lensSize={140} label="Fine print" className="w-full max-w-sm border bg-card">
      <div className="p-5">
        <h3 className="text-sm font-semibold">Terms of the offer</h3>
        <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
          The free trial lasts 14 days and ends automatically. No payment details are needed to start. You may cancel at any time from your account settings, and your data is kept for 30 days after cancellation so you can export it.
        </p>
      </div>
    </Lens>
  )
}
