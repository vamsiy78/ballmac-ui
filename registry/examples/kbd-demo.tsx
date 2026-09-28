import { Kbd, KbdGroup } from "@/components/ballmac/kbd"

export default function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
      <p>
        Press{" "}
        <KbdGroup aria-label="Command K">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>{" "}
        to search
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <KbdGroup aria-label="Command Shift P">
          <Kbd size="lg">⌘</Kbd>
          <Kbd size="lg">⇧</Kbd>
          <Kbd size="lg">P</Kbd>
        </KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd size="sm">↵</Kbd>
      </div>
    </div>
  )
}
