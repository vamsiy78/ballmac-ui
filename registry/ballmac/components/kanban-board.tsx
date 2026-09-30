// Ballmac UI: Kanban Board. https://ui.ballmac.com/components/kanban-board
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

type KanbanCard = {
  /** Stable card ID. */ id: string
  /** Card title. */ title: string
  /** Optional supporting detail. */ description?: string
  /** Optional short category. */ label?: string
}
type KanbanColumn = {
  /** Stable column ID. */ id: string
  /** Column title. */ title: string
  /** Cards in display order. */ cards: KanbanCard[]
}
type KanbanBoardProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** Controlled board state. */
  columns?: KanbanColumn[]
  /** Initial board state. */
  defaultColumns?: KanbanColumn[]
  /** Called after a card moves. */
  onColumnsChange?: (columns: KanbanColumn[]) => void
  /** Accessible name for the board. */
  label?: string
}
function KanbanBoard({
  className,
  columns,
  defaultColumns = [],
  onColumnsChange,
  label = "Task board",
  ...props
}: KanbanBoardProps) {
  const [internal, setInternal] = React.useState(defaultColumns)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const current = columns ?? internal
  const cardRefs = React.useRef(new Map<string, HTMLElement>())
  function move(cardId: string, targetIndex: number, offset?: number) {
    const sourceIndex = current.findIndex((column) =>
      column.cards.some((card) => card.id === cardId),
    )
    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= current.length)
      return
    const sourceCardIndex = current[sourceIndex].cards.findIndex(
      (card) => card.id === cardId,
    )
    const next = current.map((column) => ({
      ...column,
      cards: [...column.cards],
    }))
    const [card] = next[sourceIndex].cards.splice(sourceCardIndex, 1)
    const insertion =
      sourceIndex === targetIndex
        ? Math.max(
            0,
            Math.min(
              next[targetIndex].cards.length,
              sourceCardIndex + (offset ?? 0),
            ),
          )
        : next[targetIndex].cards.length
    next[targetIndex].cards.splice(insertion, 0, card)
    if (columns === undefined) setInternal(next)
    onColumnsChange?.(next)
    setAnnouncement(`${card.title} moved to ${next[targetIndex].title}`)
    if (typeof requestAnimationFrame === "function")
      requestAnimationFrame(() => cardRefs.current.get(cardId)?.focus())
    else cardRefs.current.get(cardId)?.focus()
  }
  return (
    <div
      data-slot="kanban-board"
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "max-w-full overflow-x-auto rounded-xl border border-border bg-muted/30 p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-max gap-3">
        {current.map((column, columnIndex) => (
          <section
            key={column.id}
            data-slot="kanban-column"
            aria-label={column.title}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              if (dragging) move(dragging, columnIndex)
              setDragging(null)
            }}
            className="bg-card w-60 shrink-0 rounded-lg border border-border p-3 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
                {column.cards.length}
              </span>
            </div>
            <div className="flex min-h-16 flex-col gap-2">
              {column.cards.map((card) => (
                <article
                  key={card.id}
                  ref={(element) => {
                    if (element) cardRefs.current.set(card.id, element)
                    else cardRefs.current.delete(card.id)
                  }}
                  data-slot="kanban-card"
                  draggable
                  tabIndex={0}
                  aria-label={`${card.title}, ${column.title}. Use Alt and arrow keys to move.`}
                  onDragStart={(event) => {
                    setDragging(card.id)
                    event.dataTransfer.effectAllowed = "move"
                    event.dataTransfer.setData("text/plain", card.id)
                  }}
                  onDragEnd={() => setDragging(null)}
                  onKeyDown={(event) => {
                    if (!event.altKey) return
                    if (event.key === "ArrowLeft")
                      move(card.id, columnIndex - 1)
                    else if (event.key === "ArrowRight")
                      move(card.id, columnIndex + 1)
                    else if (event.key === "ArrowUp")
                      move(card.id, columnIndex, -1)
                    else if (event.key === "ArrowDown")
                      move(card.id, columnIndex, 1)
                    else return
                    event.preventDefault()
                  }}
                  className="group/kanban-card bg-background rounded-md border border-border p-3 shadow-sm outline-none transition-[border-color,box-shadow] duration-150 hover:border-ring/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical
                      aria-hidden="true"
                      className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-5">
                        {card.title}
                      </p>
                      {card.description && (
                        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                          {card.description}
                        </p>
                      )}
                      {card.label && (
                        <span className="bg-secondary text-secondary-foreground mt-2 inline-block rounded-full px-2 py-0.5 text-xs">
                          {card.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-2">
                    <button
                      type="button"
                      aria-label={`Move ${card.title} to previous column`}
                      disabled={columnIndex === 0}
                      onClick={() => move(card.id, columnIndex - 1)}
                      className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40"
                    >
                      <ArrowLeft aria-hidden="true" className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${card.title} to next column`}
                      disabled={columnIndex === current.length - 1}
                      onClick={() => move(card.id, columnIndex + 1)}
                      className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40"
                    >
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-xs">
        Drag a card or use its arrow buttons. Alt + arrow keys also move a
        focused card.
      </p>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  )
}
export {
  KanbanBoard,
  type KanbanBoardProps,
  type KanbanColumn,
  type KanbanCard,
}
