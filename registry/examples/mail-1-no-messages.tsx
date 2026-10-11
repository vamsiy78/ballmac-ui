import { Mail1 } from "@/components/ballmac/blocks/mail-1/mail-1"

export default function Mail1NoMessages() {
  return <Mail1 state="empty" height="30rem" me={{ name: "Amara Singh", email: "amara@northwind.dev" }} emptyState={{ title: "Inbox zero", description: "New mail will land here. Compose something to get started." }} />
}
