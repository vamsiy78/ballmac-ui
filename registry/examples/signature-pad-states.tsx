import { SignaturePad } from "@/components/ballmac/signature-pad"
export default function SignaturePadStates() {
  return (
    <SignaturePad
      className="w-full max-w-sm"
      label="Sign by typing"
      defaultValue={{ mode: "type", text: "Alex Morgan" }}
    />
  )
}
