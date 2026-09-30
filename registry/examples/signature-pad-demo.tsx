import { SignaturePad } from "@/components/ballmac/signature-pad"
const sample = {
  mode: "draw" as const,
  strokes: [
    "M 70 138 C 85 60 95 92 95 137 C 112 117 132 115 130 139 C 149 105 164 111 157 137 C 178 98 189 116 181 140 C 211 104 219 109 214 140 C 237 119 254 120 260 131 C 295 144 331 128 356 116",
    "M 84 153 C 180 163 271 157 377 138",
  ],
}
export default function SignaturePadDemo() {
  return (
    <SignaturePad
      className="w-full max-w-sm"
      label="Your signature"
      defaultValue={sample}
      name="signature"
    />
  )
}
