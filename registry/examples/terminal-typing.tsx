import { Terminal, TerminalAnimated, TerminalLine } from "@/components/ballmac/terminal"

export default function TerminalTyping() {
  return (
    <Terminal title="zsh" className="w-full max-w-xl">
      <TerminalAnimated speed={40} lineDelay={350}>
        <TerminalLine variant="command">npx shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{"{name}"}.json</TerminalLine>
        <TerminalLine variant="success">Added @ballmac to components.json</TerminalLine>
        <TerminalLine variant="command">npx shadcn@latest add @ballmac/prompt-input</TerminalLine>
        <TerminalLine variant="success">Created 2 files</TerminalLine>
      </TerminalAnimated>
    </Terminal>
  )
}
