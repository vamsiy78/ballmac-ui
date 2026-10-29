import { Themed } from "@/components/pro/shots"
import Link from "@/components/site/link"

export type WallItem = { name: string; title: string; thumb: string; pro: boolean }

/**
 * Two rows of real screen thumbnails drifting in opposite directions, faded at the edges. Each row is drawn twice so the loop has no seam; the second copy is
 * hidden from assistive technology and the keyboard. Hovering or focusing a row pauses it. With less motion asked for, the rows stand still and scroll sideways.
 */
export function ScreenWall({ rows }: { rows: WallItem[][] }) {
  return (
    <div className="grid gap-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className="bm-marquee-track overflow-hidden py-1">
          <ul data-reverse={r % 2 ? "" : undefined} className="bm-marquee flex w-max gap-4" style={{ "--bm-marquee-duration": `${row.length * 6}s` } as React.CSSProperties}>
            {[0, 1].map((copy) =>
              row.map((item) => (
                <li key={`${copy}-${item.name}`} aria-hidden={copy ? true : undefined} className="group relative w-[19rem] shrink-0 sm:w-[23rem]">
                  <div className="bg-card group-hover:border-foreground/30 relative aspect-[2/1] overflow-hidden rounded-2xl border shadow-[0_18px_40px_-28px_rgb(0_0_0/0.45)] transition-[border-color,transform] duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                    <Themed base={item.thumb} alt="" width={800} height={400} className="absolute inset-0 size-full object-cover object-top" />
                    {item.pro && <span className="bg-foreground text-background absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide">PRO</span>}
                  </div>
                  <Link
                    href={`/blocks/${item.name}`}
                    tabIndex={copy ? -1 : undefined}
                    className="text-muted-foreground group-hover:text-foreground mt-2.5 block truncate px-1 text-[13px] outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                  >
                    {item.title}
                  </Link>
                </li>
              )),
            )}
          </ul>
        </div>
      ))}
    </div>
  )
}
