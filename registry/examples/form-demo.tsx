"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ballmac/checkbox";
import { Form, FormField, FormSubmit } from "@/components/ballmac/form";
import { Input } from "@/components/ballmac/input";
type Values = { name: string; email: string; terms: boolean };
export default function FormDemo() {
  const form = useForm<Values>({ defaultValues: { name: "", email: "jordan@", terms: false }, mode: "onTouched" });
  const [done, setDone] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Create your account</h3>
        <p className="text-sm text-muted-foreground">Free for 14 days. No card needed.</p>
      </div>
      <Form
        form={form}
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 900));
          setDone(values.name);
        }}
      >
        <FormField
          name="name"
          label="Full name"
          required
          rules={{ required: "Tell us your name.", minLength: { value: 2, message: "Use at least 2 characters." } }}
          render={(props) => <Input autoComplete="name" placeholder="Jordan Rivera" {...props} />}
        />
        <FormField
          name="email"
          label="Work email"
          description="We send a confirmation link here."
          required
          rules={{
            required: "Enter your email.",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a full email address, like name@acme.com." },
          }}
          render={(props) => <Input type="email" autoComplete="email" {...props} />}
        />
        <FormField
          name="terms"
          orientation="horizontal"
          label="I agree to the terms of service"
          rules={{ validate: (v) => v || "Accept the terms to continue." }}
          render={({ value, onChange, ref, name, onBlur, ...rest }) => (
            <Checkbox ref={ref} name={name} onBlur={onBlur} checked={!!value} onCheckedChange={(v) => onChange(v === true)} {...rest} />
          )}
        />
        <FormSubmit pendingText="Creating account…">Create account</FormSubmit>
        {done && (
          <p role="status" className="flex items-center gap-2 text-sm text-chart-2">
            <CheckCircle2 aria-hidden="true" className="size-4" /> Welcome, {done}. Check your inbox.
          </p>
        )}
      </Form>
    </div>
  );
}
