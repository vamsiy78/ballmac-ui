import { Callout } from "@/components/ballmac/callout"
export default function CalloutDemo() {
  return (
    <Callout
      className="w-full max-w-md"
      title="Make the first view useful"
      kind="tip"
      action={
        <a
          href="#examples"
          className="text-primary rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          See layout examples →
        </a>
      }
    >
      Start with the information people check every day. Save advanced controls
      for the details view.
    </Callout>
  )
}
