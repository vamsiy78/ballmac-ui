import { InlineAlert } from "@/components/ballmac/inline-alert"
export default function InlineAlertDemo() {
  return (
    <InlineAlert
      className="w-full max-w-md"
      tone="success"
      message="Your changes were saved. Everyone on the team has the latest version."
    />
  )
}
