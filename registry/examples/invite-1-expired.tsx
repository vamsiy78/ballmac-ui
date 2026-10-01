import { Invite1 } from "@/components/ballmac/blocks/invite-1/invite-1"

export default function Invite1Expired() {
  return (
    <Invite1
      status="expired"
      workspace={{ name: "Fjord Labs", members: 9, color: "chart-5" }}
      inviter={{ name: "Ingrid Larsen" }}
      email="amara@northwind.dev"
    />
  )
}
