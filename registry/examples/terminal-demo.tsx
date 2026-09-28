import { Terminal, TerminalLine } from "@/components/ballmac/terminal"

export default function TerminalDemo() {
  return (
    <Terminal title="~/my-app" className="w-full max-w-xl">
      <TerminalLine variant="command" copyable>
        pnpm dlx shadcn@latest add @ballmac/button
      </TerminalLine>
      <TerminalLine>✔ Checking registry.</TerminalLine>
      <TerminalLine>✔ Installing dependencies.</TerminalLine>
      <TerminalLine variant="success">Created 1 file: components/ballmac/button.tsx</TerminalLine>
      <TerminalLine variant="comment"># Import it from @/components/ballmac/button</TerminalLine>
    </Terminal>
  )
}
