import { RefreshCw } from "lucide-react"

import { Error1 } from "@/components/ballmac/blocks/error-1/error-1"

export default function Error1Server() {
  return (
    <Error1
      status="500"
      reference="req_8f2a91c4"
      search={false}
      links={[
        { label: "System status", description: "See if we’re having issues", href: "#", icon: <RefreshCw /> },
        { label: "Contact support", description: "Quote the reference above", href: "#" },
      ]}
    />
  )
}
