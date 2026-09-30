import { InlineAlert } from "@/components/ballmac/inline-alert"
export default function InlineAlertStates() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InlineAlert message="You can invite more members after setup." />
      <InlineAlert
        tone="error"
        message="This link has expired. Request a new invitation."
        action={
          <a
            href="#invite"
            className="text-destructive rounded-sm text-xs font-semibold underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Request link
          </a>
        }
      />
    </div>
  )
}
