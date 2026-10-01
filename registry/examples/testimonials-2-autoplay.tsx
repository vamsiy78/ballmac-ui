import { Testimonials2 } from "@/components/ballmac/blocks/testimonials-2/testimonials-2"

export default function Testimonials2Autoplay() {
  return (
    <Testimonials2
      eyebrow="From our customers"
      autoplay={6000}
      items={[
        { quote: "Our whole design team moved over in a week, and nobody asked to go back.", name: "Yuki Tanaka", role: "Design Lead", company: "Paper Co.", result: "Adopted in 5 days" },
        { quote: "Reviews that used to take a meeting now happen in the comments.", name: "Sam Okafor", role: "Product Manager", company: "Lumen", result: "4 fewer meetings a week" },
        { quote: "It is the quietest, fastest tool in our stack. That is the highest praise I have.", name: "Ingrid Larsen", role: "CTO", company: "Fjord Labs" },
      ]}
    />
  )
}
