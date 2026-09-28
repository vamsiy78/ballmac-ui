import { Search } from "lucide-react"

import { InputGroup, InputGroupAddon, Input } from "@/components/ballmac/input"
import { Kbd, KbdGroup } from "@/components/ballmac/kbd"

export default function InputWithIcon() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <Input type="search" placeholder="Search documentation" aria-label="Search documentation" />
        <InputGroupAddon align="end">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <Input placeholder="your-site" aria-label="Domain name" />
        <InputGroupAddon align="end">.com</InputGroupAddon>
      </InputGroup>
    </div>
  )
}
