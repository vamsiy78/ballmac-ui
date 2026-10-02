// Ballmac UI: Bento Grid. https://ui.ballmac.com/components/bento-grid
import * as React from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

type BentoGridProps = React.ComponentProps<"div"> & {
  /** Columns once the grid is wider than 36rem; narrower grids stack in one column. */
  columns?: 2 | 3 | 4
  /** Minimum height of one row, any CSS length. */
  rowHeight?: string
}

const COLUMNS = {
  2: "@xl/bento:grid-cols-2",
  3: "@xl/bento:grid-cols-3",
  4: "@xl/bento:grid-cols-2 @4xl/bento:grid-cols-4",
} as const

function BentoGrid({ columns = 3, rowHeight = "13rem", className, style, children, ...props }: BentoGridProps) {
  return (
    <div data-slot="bento-grid" className={cn("@container/bento w-full", className)} style={style} {...props}>
      <div
        className={cn("grid grid-cols-1 gap-3 auto-rows-[minmax(var(--bento-row),auto)]", COLUMNS[columns])}
        style={{ "--bento-row": rowHeight } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}

type BentoCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Columns the card spans in the wide layout. */
  colSpan?: 1 | 2 | 3 | 4
  /** Rows the card spans in the wide layout. */
  rowSpan?: 1 | 2
  /** Decorative visual that fills the card behind the text; it fades out toward the text. */
  background?: React.ReactNode
  /** Small icon shown above the title. */
  icon?: React.ReactNode
  /** Card title. */
  title: React.ReactNode
  /** One or two lines under the title. */
  description?: React.ReactNode
  /** Makes the whole card a link to this URL. */
  href?: string
  /** Label of the link revealed on hover and focus. */
  cta?: string
}

const COL_SPAN = { 1: "", 2: "@xl/bento:col-span-2", 3: "@xl/bento:col-span-3", 4: "@xl/bento:col-span-2 @4xl/bento:col-span-4" } as const
const ROW_SPAN = { 1: "", 2: "@xl/bento:row-span-2" } as const

function BentoCard({
  colSpan = 1,
  rowSpan = 1,
  background,
  icon,
  title,
  description,
  href,
  cta = "Learn more",
  className,
  children,
  ...props
}: BentoCardProps) {
  return (
    <div
      data-slot="bento-card"
      className={cn(
        "group/bento relative isolate flex min-h-(--bento-row) flex-col justify-end overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[border-color,box-shadow] duration-200 hover:border-foreground/15 has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring/50 dark:shadow-none",
        COL_SPAN[colSpan],
        ROW_SPAN[rowSpan],
        className
      )}
      {...props}
    >
      {background && (
        <div
          aria-hidden="true"
          inert
          data-slot="bento-card-background"
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_35%,transparent_72%)] transition-transform duration-500 ease-(--bm-ease-out) group-hover/bento:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/bento:scale-100"
        >
          {background}
        </div>
      )}
      {children}
      <div
        data-slot="bento-card-content"
        className={cn(
          "relative p-5 transition-transform duration-300 ease-(--bm-ease-out) motion-reduce:transition-none",
          // Slides up to make room for the link, only where hover exists; touch screens always show it.
          href && "[@media(hover:hover)]:translate-y-9 [@media(hover:hover)]:group-hover/bento:translate-y-0 [@media(hover:hover)]:group-has-[a:focus-visible]/bento:translate-y-0"
        )}
      >
        {icon && (
          <div className="mb-3 flex size-9 items-center justify-center rounded-lg border bg-background/80 text-foreground shadow-xs backdrop-blur [&_svg]:size-4">
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
        {href && (
          <a
            href={href}
            data-slot="bento-card-link"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium outline-none transition-opacity duration-300 after:absolute after:inset-0 after:content-[''] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/bento:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
          >
            {cta}
            <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-200 group-hover/bento:translate-x-0.5 rtl:rotate-180 rtl:group-hover/bento:-translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  )
}

export { BentoGrid, BentoCard, type BentoGridProps, type BentoCardProps }
