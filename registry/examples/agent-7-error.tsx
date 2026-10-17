import { Agent7 } from "@/components/ballmac/blocks/agent-7/agent-7"

export default function Agent7Error() {
  return <Agent7 state="error" errorState={{ description: "The model Lyra Mid is not available on your plan. Pick another model and publish again." }} />
}
