import { AutonomyDial, type AutonomyLevel } from "@/components/ballmac/autonomy-dial"

const levels: AutonomyLevel[] = [
  { value: "review", label: "Review only", summary: "Drafts replies and leaves every one for you to send.", does: ["Reads the thread", "Drafts a reply"], asks: ["Sending anything"] },
  { value: "routine", label: "Routine replies", summary: "Sends replies to common questions on its own and asks about the rest.", does: ["Answers shipping and order-status questions", "Tags and files the thread"], asks: ["Refunds", "Anything angry or unusual"] },
  { value: "inbox", label: "Run the inbox", summary: "Handles the whole inbox and reports back each evening.", does: ["Replies, tags and escalates", "Issues refunds up to a limit you set"], asks: ["Refunds above the limit", "Legal or press requests"] },
]

export default function AutonomyDialCustom() {
  return (
    <div className="w-full max-w-xl">
      <AutonomyDial levels={levels} defaultValue="routine" label="How much should the support agent handle?" />
    </div>
  )
}
