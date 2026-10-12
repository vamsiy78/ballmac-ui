"use client"

import { Signup1 } from "@/components/ballmac/blocks/signup-1/signup-1"

export default function Signup1Success() {
  return <Signup1 state="success" defaultValues={{ name: "Jordan Lee", email: "jordan@acme.com" }} />
}
