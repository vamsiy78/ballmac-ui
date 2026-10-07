import { Terminal, TerminalAnimated, TerminalLine } from "@/components/ballmac/terminal"

export default function TerminalTyping() {
  return (
    <Terminal title="zsh" className="w-full max-w-xl">
      <TerminalAnimated speed={40} lineDelay={350}>
        <TerminalLine variant="command">npx shadcn@latest add @ballmac/prompt-input</TerminalLine>
        <TerminalLine variant="success">Created 2 files</TerminalLine>
        <TerminalLine variant="command">npx shadcn@latest add @ballmac/dock</TerminalLine>
        <TerminalLine variant="success">Created 1 file</TerminalLine>
      </TerminalAnimated>
    </Terminal>
  )
}
