"use client"

import { Login2 } from "@/components/ballmac/blocks/login-2/login-2"

/** Rejecting in onSubmit shows the error message. Try any email and password. */
export default function Login2Error() {
  return (
    <Login2
      brand="Northwind"
      title="Sign in"
      description="Use your work email."
      onPasskey={null}
      onSubmit={() => Promise.reject(new Error("invalid"))}
      quote="The quietest, fastest tool in our stack. Our team lives in it."
      author={{ name: "Ingrid Larsen", role: "CTO, Fjord Labs" }}
    />
  )
}
