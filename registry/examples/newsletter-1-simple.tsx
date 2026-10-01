import { Newsletter1 } from "@/components/ballmac/blocks/newsletter-1/newsletter-1"

export default function Newsletter1Simple() {
  return (
    <Newsletter1
      eyebrow="Weekly digest"
      title="Stay in the loop."
      description="A short Friday email with what shipped this week. Unsubscribe any time."
      topics={[]}
      buttonLabel="Sign me up"
      proof="Read by 3,100 engineers"
      issue={{ name: "Shipped", number: "No. 112", headlines: ["Faster builds, again", "A new way to roll back", "Community picks"] }}
    />
  )
}
