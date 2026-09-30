"use client";
import * as React from "react";
import { InviteMembers, type PendingInvite } from "@/components/ballmac/invite-members";
const roles = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];
export default function InviteMembersDemo() {
  const [pending, setPending] = React.useState<PendingInvite[]>([
    { email: "kofi@acme.example", role: "member", sent: "Sent 2 days ago" },
    { email: "mei@acme.example", role: "viewer", sent: "Sent yesterday" },
  ]);
  return (
    <InviteMembers
      className="max-w-xl"
      roles={roles}
      defaultRole="member"
      existing={["ana@acme.example"]}
      pending={pending}
      onInvite={async (invites) => {
        await new Promise((r) => setTimeout(r, 700));
        setPending((p) => [...invites.map((i) => ({ ...i, sent: "Just now" })), ...p]);
      }}
      onResend={() => undefined}
      onRevoke={(email) => setPending((p) => p.filter((x) => x.email !== email))}
    />
  );
}
