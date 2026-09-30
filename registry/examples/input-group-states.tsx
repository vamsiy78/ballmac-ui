import { AlertCircle, Mail } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ballmac/input-group";
export default function InputGroupStates() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <InputGroup aria-label="Invalid email">
        <InputGroupAddon>
          <Mail aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Email" aria-invalid="true" defaultValue="jordan@" />
        <InputGroupAddon align="inline-end">
          <AlertCircle aria-hidden="true" className="text-destructive" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup aria-label="Disabled email">
        <InputGroupAddon>
          <Mail aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Billing email" disabled defaultValue="billing@acme.example" />
      </InputGroup>
    </div>
  );
}
