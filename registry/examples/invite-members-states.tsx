"use client";
import { InviteMembers } from "@/components/ballmac/invite-members";
export default function InviteMembersStates() {
  return (
    <InviteMembers
      className="max-w-md"
      title="Add people to Design"
      description="Only people you invite can see this team."
      roles={[{ value: "editor", label: "Can edit" }, { value: "viewer", label: "Can view" }]}
    />
  );
}
