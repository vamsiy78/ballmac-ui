"use client";
import { useForm } from "react-hook-form";
import { Form, FormField, FormSubmit } from "@/components/ballmac/form";
import { Input } from "@/components/ballmac/input";
import { Textarea } from "@/components/ballmac/textarea";
type Values = { subject: string; message: string };
export default function FormStates() {
  const form = useForm<Values>({ defaultValues: { subject: "", message: "" } });
  return (
    <Form form={form} onSubmit={() => new Promise((r) => setTimeout(r, 1500))} className="max-w-sm">
      <FormField name="subject" label="Subject" rules={{ required: "Add a subject." }} render={(p) => <Input {...p} />} />
      <FormField
        name="message"
        label="Message"
        description="Up to 200 characters."
        rules={{ maxLength: { value: 200, message: "Keep it under 200 characters." } }}
        render={(p) => <Textarea rows={3} {...p} />}
      />
      <FormSubmit pendingText="Sending…">Send message</FormSubmit>
    </Form>
  );
}
