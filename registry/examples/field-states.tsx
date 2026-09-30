import { Checkbox } from "@/components/ballmac/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ballmac/field";
import { Switch } from "@/components/ballmac/switch";
export default function FieldStates() {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend variant="label">Notifications</FieldLegend>
      <FieldGroup className="gap-4">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="field-product">Product updates</FieldLabel>
            <FieldDescription>New features, once a month.</FieldDescription>
          </FieldContent>
          <Switch id="field-product" defaultChecked />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="field-security">Security alerts</FieldLabel>
            <FieldDescription>Always on for account safety.</FieldDescription>
          </FieldContent>
          <Switch id="field-security" defaultChecked disabled />
        </Field>
        <FieldSeparator>or</FieldSeparator>
        <Field orientation="horizontal" disabled>
          <Checkbox id="field-digest" disabled />
          <FieldLabel htmlFor="field-digest">Weekly digest (unavailable)</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
