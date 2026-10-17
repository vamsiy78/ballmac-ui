import { Agent4 } from "@/components/ballmac/blocks/agent-4/agent-4"

export default function Agent4Error() {
  return <Agent4 state="error" errorState={{ description: "The request was rate limited. Try again in a minute." }} />
}
