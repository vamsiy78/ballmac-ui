import { ScrambleText } from "@/components/ballmac/scramble-text"

const links = ["Product", "Changelog", "Pricing", "Careers"]

export default function ScrambleTextHover() {
  return (
    <nav aria-label="Main" className="flex flex-wrap items-center justify-center gap-1 rounded-full border bg-card p-1.5">
      {links.map((link) => (
        <a
          key={link}
          href="#"
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ScrambleText trigger="hover" mono duration={450} speed={30}>
            {link.toUpperCase()}
          </ScrambleText>
        </a>
      ))}
    </nav>
  )
}
