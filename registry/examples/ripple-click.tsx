import { ClickRipple } from "@/components/ballmac/ripple"

export default function RippleClick() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      {["Inbox", "Drafts", "Sent", "Archive"].map((label) => (
        <ClickRipple key={label} className="cursor-pointer rounded-xl border bg-card p-5 text-center text-sm font-medium select-none">
          {label}
        </ClickRipple>
      ))}
    </div>
  )
}
