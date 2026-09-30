import { Callout } from "@/components/ballmac/callout"
export default function CalloutStates() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Callout kind="note" title="About exports">
        Exports include visible filters and date ranges.
      </Callout>
      <Callout kind="caution" title="Before you delete">
        This action removes the workspace for every member.
      </Callout>
    </div>
  )
}
