import { Faq2 } from "@/components/ballmac/blocks/faq-2/faq-2"

export default function Faq2Compact() {
  return (
    <Faq2
      title="Shipping and returns"
      description="Everything about getting your order, and sending it back."
      support={{ label: "Chat with us", href: "#", text: "Need a hand with an order?" }}
      categories={[
        {
          name: "Shipping",
          questions: [
            { question: "How long does delivery take?", answer: "Orders ship within one business day and arrive in two to five days within the United States." },
            { question: "Do you ship internationally?", answer: "Yes, to over 40 countries. Duties and taxes are calculated at checkout so there are no surprises." },
          ],
        },
        {
          name: "Returns",
          questions: [
            { question: "What is your return policy?", answer: "Return anything unused within 30 days for a full refund. We email you a prepaid label." },
            { question: "How do I exchange an item?", answer: "Start a return and choose Exchange. We send the new size as soon as the first one is scanned." },
          ],
        },
      ]}
    />
  )
}
