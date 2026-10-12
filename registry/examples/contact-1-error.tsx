"use client"

import { Contact1 } from "@/components/ballmac/blocks/contact-1/contact-1"

export default function Contact1Error() {
  return <Contact1 state="error" defaultValues={{ name: "Jordan Lee", email: "jordan@acme.com", message: "Hi, we would like a demo for our finance team." }} />
}
