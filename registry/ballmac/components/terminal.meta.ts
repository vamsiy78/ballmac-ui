import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "terminal",
  type: "registry:ui",
  title: "Terminal",
  description:
    "A terminal window with command, output, success, error and comment lines, optional per-command copy buttons and a sequenced typing animation that respects reduced motion.",
  category: "developer",
  tags: ["terminal", "cli", "shell", "command", "typing", "developer", "docs"],
  files: [{ path: "components/terminal.tsx" }],
  dependencies: ["class-variance-authority", "lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "terminal-demo", title: "Default", file: "terminal-demo.tsx" },
    { name: "terminal-typing", title: "Typing animation", file: "terminal-typing.tsx" },
  ],
  ai: {
    summary:
      "Show CLI sessions: <Terminal title> with <TerminalLine variant='command' copyable> and output lines. Wrap lines in <TerminalAnimated> to type commands out and reveal output in order when scrolled into view.",
    whenToUse: [
      "Install and setup steps on landing pages and docs",
      "Showing what a CLI prints, including success and error lines",
      "An animated hero that types a command and its result",
    ],
    whenNotToUse: [
      "Copyable install commands for several package managers (use install-tabs)",
      "Source code files (use code-block)",
      "A real interactive shell (this renders static or scripted lines only)",
    ],
    composesWith: ["install-tabs", "code-block"],
    a11y: [
      { keys: "Tab", action: "Focuses the copy button on command lines (hidden until hover on mouse devices, visible on focus)" },
      { keys: "—", action: "The prompt symbol is hidden from screen readers; success and error lines carry a text prefix, not just color; aria-busy is set while animating" },
    ],
    customization: [
      "theme: dark (default; scopes the theme's .dark tokens to the window) | inherit (follows the page)",
      "TerminalLine variant: command | output | success | error | comment; prompt changes the '$'",
      "TerminalLine typing + speed (chars/sec) types a single command; inside TerminalAnimated commands type automatically",
      "TerminalAnimated speed, lineDelay (ms), startDelay (ms), startOnView, onComplete",
      "Reduced motion shows every line immediately",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
