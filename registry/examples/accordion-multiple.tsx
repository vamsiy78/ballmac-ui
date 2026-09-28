import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"

export default function AccordionMultiple() {
  return (
    <Accordion type="multiple" defaultValue={["shipping", "returns"]} className="max-w-lg">
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Orders ship within two business days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Return anything within 30 days for a full refund.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionContent>Every product has a one-year warranty.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
