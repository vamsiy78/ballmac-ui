"use client"

import { Api1 } from "@/components/ballmac/blocks/api-1/api-1"

export default function Api1Notfound() {
  return <Api1 defaultRequest={{ url: "https://api.acme.com/v1/users/usr_99" }} defaultResponse={{ status: 404, statusText: "Not Found", ms: 96, headers: { "content-type": "application/json", "x-request-id": "req_2b7d90" }, body: { error: { code: "not_found", message: "No user with id usr_99." } } }} />
}
