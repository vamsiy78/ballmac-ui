import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible defaultValue="install" className="max-w-lg">
      <AccordionItem value="install">
        <AccordionTrigger>Where do components get installed?</AccordionTrigger>
        <AccordionContent>Into components/ballmac, so they never overwrite your shadcn/ui files.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="theme">
        <AccordionTrigger>Do I need the Ballmac theme?</AccordionTrigger>
        <AccordionContent>No. Components use the standard shadcn CSS variables and follow your theme.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="license">
        <AccordionTrigger>Can I use them commercially?</AccordionTrigger>
        <AccordionContent>Yes. Free components work in personal, client and commercial projects.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
