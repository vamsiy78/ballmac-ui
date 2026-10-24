"use client"

import { Incident1 } from "@/components/ballmac/blocks/incident-1/incident-1"

export default function Incident1Resolved() {
  return <Incident1 incident={{ id: "INC-2038", title: "Search was slow for an hour", severity: "SEV3", status: "resolved", startedAt: "09:10", duration: "58 min", impact: "Search results took up to ten seconds to load.", roles: { commander: "Noor Haddad", ops: "Kofi Mensah" }, updates: [{ id: "a", time: "10:08", author: "Noor Haddad", status: "resolved", body: "The index is rebuilt and search is back to normal." }, { id: "b", time: "09:30", author: "Kofi Mensah", status: "identified", body: "A nightly job was holding a lock on the index." }] }} />
}
