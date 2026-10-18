"use client"

import { Api1 } from "@/components/ballmac/blocks/api-1/api-1"

export default function Api1Created() {
  return <Api1 defaultRequest={{ method: "POST", url: "https://api.acme.com/v1/users" }} defaultResponse={{ status: 201, statusText: "Created", ms: 142, headers: { "content-type": "application/json", "x-request-id": "req_8f3a1c" }, body: { id: "usr_4", name: "Sam Okafor", email: "sam@acme.com", role: "member" } }} />
}
