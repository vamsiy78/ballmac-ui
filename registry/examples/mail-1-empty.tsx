import { Mail1 } from "@/components/ballmac/blocks/mail-1/mail-1"

export default function Mail1Empty() {
  return (
    <Mail1
      height="30rem"
      me={{ name: "Amara Singh", email: "amara@northwind.dev" }}
      messages={[
        {
          id: "only",
          folder: "inbox",
          unread: true,
          time: "Just now",
          from: { name: "Northwind", email: "hello@northwind.dev" },
          subject: "Welcome to your new inbox",
          body: ["This is the only message here. Archive it, star it, reply to it, or compose a new one from the folders list."],
        },
      ]}
    />
  )
}
