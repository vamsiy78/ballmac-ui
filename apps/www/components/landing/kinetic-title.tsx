import { cn } from "@/lib/utils"

/**
 * Big display words whose letters roll into place like a split-flap board: each letter is a short column of copies of itself that slides up and stops on
 * the last one, every column with its own length and timing, so the word settles from a jumble. Pure CSS, no script. Screen readers, search engines and copy-paste get
 * the plain words once; the columns are hidden from them and draw their letters with CSS. With reduced motion the columns do not move, and the letters simply stand still.
 */
export function KineticTitle({ lines, className }: { lines: string[]; className?: string }) {
  let n = 0
  return (
    <span className={cn("bm-kinetic block", className)}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line) => (
        <span key={line} aria-hidden="true" className="flex justify-center whitespace-pre">
          {[...line].map((ch, i) => {
            const k = n++
            if (ch === " ") return <span key={i} className="inline-block w-[0.28em]" />
            // A spread of column lengths and delays, fixed by position so the server and the browser draw the same thing.
            const copies = 3 + ((k * 7) % 6)
            return (
              <span key={i} className="bm-roll relative inline-block h-[0.86em] overflow-hidden leading-[0.86]" style={{ "--n": copies - 1, "--d": `${(k % 5) * 0.07 + (k % 3) * 0.05}s`, "--t": `${0.9 + ((k * 3) % 5) * 0.12}s` } as React.CSSProperties}>
                <span className="bm-roll-col flex flex-col">
                  {Array.from({ length: copies }, (_, j) => (
                    // The letter is drawn by CSS, not written into the page: search engines and copy-paste read the words once, from the sr-only line.
                    <span key={j} data-c={ch} className="block h-[0.86em] before:content-[attr(data-c)]" />
                  ))}
                </span>
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
