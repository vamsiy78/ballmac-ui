import { Settings3 } from "@/components/ballmac/blocks/settings-3/settings-3"

/** Every seat is taken, so inviting shows the plan-limit message. */
export default function Settings3Full() {
  return (
    <Settings3
      title="People"
      description="Your plan includes four seats."
      seats={4}
      roles={["Admin", "Member"]}
      members={[
        { id: "a", name: "Ingrid Larsen", email: "ingrid@fjord.no", role: "Owner", status: "active", lastActive: "Active now" },
        { id: "b", name: "Sam Okafor", email: "sam@fjord.no", role: "Admin", status: "active", lastActive: "1 hour ago" },
        { id: "c", name: "Yuki Tanaka", email: "yuki@fjord.no", role: "Member", status: "active", lastActive: "Yesterday" },
        { id: "d", name: "lena@fjord.no", email: "lena@fjord.no", role: "Member", status: "invited" },
      ]}
    />
  )
}
