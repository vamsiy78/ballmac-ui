import { Input } from "@/components/ballmac/input"

export default function InputDemo() {
  return (
    <div className="w-full max-w-sm">
      <Input type="email" placeholder="Email address" autoComplete="email" aria-label="Email address" />
    </div>
  )
}
