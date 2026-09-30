"use client";
import * as React from "react";
import { Button } from "@/components/ballmac/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  useFieldControl,
} from "@/components/ballmac/field";
import { Input } from "@/components/ballmac/input";

function EmailInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />;
}
function SubdomainInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />;
}
export default function FieldDemo() {
  const [email, setEmail] = React.useState("jordan@");
  const [touched, setTouched] = React.useState(true);
  const emailError = touched && !/^\S+@\S+\.\S+$/.test(email) ? "Enter a full email address, like name@acme.com." : undefined;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
      }}
      className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-sm"
    >
      <FieldGroup>
        <Field invalid={!!emailError}>
          <FieldLabel required>Work email</FieldLabel>
          <EmailInput
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          <FieldDescription>We send the invite here.</FieldDescription>
          <FieldError errors={[emailError]} />
        </Field>
        <Field>
          <FieldLabel>Workspace URL</FieldLabel>
          <SubdomainInput placeholder="acme" />
          <FieldDescription>Letters, numbers and hyphens.</FieldDescription>
        </Field>
        <Button type="submit">Send invite</Button>
      </FieldGroup>
    </form>
  );
}
