"use client"

import { Verify1 } from "@/components/ballmac/blocks/verify-1/verify-1"

/** A four-digit code that is checked by your own function. The right code is 4242. */
export default function Verify1Four() {
  return (
    <Verify1
      email="amara@northwind.dev"
      title="Confirm it’s you"
      length={4}
      resendAfter={10}
      onChangeEmail={null}
      onVerify={async (code) => {
        await new Promise((r) => setTimeout(r, 600))
        if (code !== "4242") throw new Error("wrong")
      }}
    />
  )
}
