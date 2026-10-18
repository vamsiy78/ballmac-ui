// Ballmac UI: Sortable. https://ui.ballmac.com/components/sortable
// Based on dnd-kit (MIT, Copyright (c) 2021 Claudéric Demers), composed into list, grid and multi-list parts with translated announcements, move buttons and reduced motion.
"use client"

import * as React from "react"
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DraggableAttributes,
  type Modifier,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS as DndCSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, GripVertical } from "lucide-react"
import { useReducedMotion } from "motion/react"

import { useDirection } from "@/lib/ballmac/direction"
import { useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type SortableOrientation = "vertical" | "horizontal" | "grid"
type SortableInfo = { activeId: string; from: number; to: number }

// ---------------------------------------------------------------- shared context

type RootContext = {
  orientation: SortableOrientation
  disabled: boolean
  reduced: boolean
  rtl: boolean
  labelOf: (id: string) => string
  /** Where an item sits, as a group id and index, so a move button knows its neighbours. */
  locate: (id: string) => { group: string; index: number; count: number } | null
  move: (id: string, delta: -1 | 1) => void
  /** What the overlay draws for the item being dragged. */
  register: (id: string, render: () => React.ReactNode) => () => void
  activeId: string | null
}
const RootCtx = React.createContext<RootContext | null>(null)
const useRoot = () => {
  const ctx = React.useContext(RootCtx)
  if (!ctx) throw new Error("Sortable parts must be used inside <Sortable> or <SortableGroups>.")
  return ctx
}

type ItemContext = {
  id: string
  label: string
  attributes: DraggableAttributes | null
  listeners: ReturnType<typeof useSortable>["listeners"]
  setActivatorNodeRef: ((el: HTMLElement | null) => void) | null
  dragging: boolean
  overlay: boolean
}
const ItemCtx = React.createContext<ItemContext | null>(null)
const useItem = () => {
  const ctx = React.useContext(ItemCtx)
  if (!ctx) throw new Error("SortableHandle and SortableMove must be used inside <SortableItem>.")
  return ctx
}

// ---------------------------------------------------------------- engine pieces both lists share

const strategyFor = (o: SortableOrientation) => (o === "vertical" ? verticalListSortingStrategy : o === "horizontal" ? horizontalListSortingStrategy : rectSortingStrategy)

/** Keeps a list on its own axis while it is dragged. */
const axisModifier = (o: SortableOrientation): Modifier | undefined =>
  o === "vertical" ? ({ transform }) => ({ ...transform, x: 0 }) : o === "horizontal" ? ({ transform }) => ({ ...transform, y: 0 }) : undefined

function useSortableSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
}

/** The pieces of one drag the page needs to show: what is lifted, and a live region for the keyboard moves of the move buttons. */
function useEngineState(labelOf: (id: string) => string) {
  const msg = useMessages()
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [spoken, setSpoken] = React.useState("")
  const renderers = React.useRef(new Map<string, () => React.ReactNode>())
  const register = React.useCallback((id: string, render: () => React.ReactNode) => {
    renderers.current.set(id, render)
    return () => {
      renderers.current.delete(id)
    }
  }, [])
  const instructions = msg(
    "sortable.instructions",
    "To pick up an item, press Space or Enter. While dragging, use the arrow keys to move it, Space or Enter to drop it, and Escape to cancel."
  )
  return { msg, activeId, setActiveId, spoken, setSpoken, renderers, register, instructions, labelOf }
}

// ---------------------------------------------------------------- Sortable: one list or grid

type SortableProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** The ids of the items, in order. */
  value: string[]
  /** Called with the new order when an item is dropped or moved with a button. Keep it in state and render the items in that order. */
  onValueChange: (ids: string[], info: SortableInfo) => void
  /** What the list is, read by screen readers: "Playlist". */
  label: string
  /** "vertical" (default) and "horizontal" lists move on one axis; "grid" moves anywhere. */
  orientation?: SortableOrientation
  /** Says each item's name when it is picked up and dropped. Defaults to the item's `label`, then its id. */
  getLabel?: (id: string) => string
  disabled?: boolean
  /** Draw the lifted item in a floating layer under the pointer. Turn off for items that need to stay in place. */
  overlay?: boolean
  /** The items: `SortableItem`s, in the same order as `value`. */
  children: React.ReactNode
}

/**
 * Reorder a list by dragging. Use a handle, the keyboard (Space to lift, arrows to move, Space to drop) or the move buttons, which are the
 * alternative for people who cannot drag. The new order is yours to keep: `value` and `onValueChange`.
 */
function Sortable({
  value: ids,
  onValueChange,
  label,
  orientation = "vertical",
  getLabel,
  disabled = false,
  overlay = true,
  className,
  children,
  ...props
}: SortableProps) {
  const dir = useDirection()
  const reduced = !!useReducedMotion()
  const labels = React.useRef(new Map<string, string>())
  const labelOf = React.useCallback((id: string) => getLabel?.(id) ?? labels.current.get(id) ?? id, [getLabel])
  const engine = useEngineState(labelOf)
  const { msg, activeId, setActiveId } = engine
  const sensors = useSortableSensors()

  const commit = (next: string[], info: SortableInfo) => onValueChange(next, info)
  const position = (id: UniqueIdentifier | undefined) => ids.indexOf(String(id)) + 1

  const announcements: Announcements = {
    onDragStart: ({ active }) => msg("sortable.pickedUp", "Picked up {item}. It is position {position} of {total}.", { item: labelOf(String(active.id)), position: position(active.id), total: ids.length }),
    onDragOver: ({ active, over }) => (over ? msg("sortable.over", "{item} is over position {position} of {total}.", { item: labelOf(String(active.id)), position: position(over.id), total: ids.length }) : undefined),
    onDragEnd: ({ active, over }) =>
      over
        ? msg("sortable.dropped", "Dropped {item} at position {position} of {total}.", { item: labelOf(String(active.id)), position: position(over.id), total: ids.length })
        : msg("sortable.droppedBack", "Dropped {item}. It did not move.", { item: labelOf(String(active.id)) }),
    onDragCancel: ({ active }) => msg("sortable.cancelled", "Cancelled. {item} went back to position {position}.", { item: labelOf(String(active.id)), position: position(active.id) }),
  }

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    commit(arrayMove(ids, from, to), { activeId: String(active.id), from, to })
  }

  const move = React.useCallback(
    (id: string, delta: -1 | 1) => {
      const from = ids.indexOf(id)
      const to = from + delta
      if (from < 0 || to < 0 || to >= ids.length) return
      commit(arrayMove(ids, from, to), { activeId: id, from, to })
      engine.setSpoken(msg("sortable.moved", "Moved {item} to position {position} of {total}.", { item: labelOf(id), position: to + 1, total: ids.length }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ids, labelOf]
  )
  useRefocusAfterMove(ids)

  const ctx: RootContext = {
    orientation,
    disabled,
    reduced,
    rtl: dir === "rtl",
    labelOf,
    locate: (id) => {
      const index = ids.indexOf(id)
      return index < 0 ? null : { group: "", index, count: ids.length }
    },
    move,
    register: engine.register,
    activeId,
  }

  return (
    <RootCtx.Provider value={ctx}>
      <LabelRegistry.Provider value={labels}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          modifiers={axisModifier(orientation) ? [axisModifier(orientation)!] : undefined}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
          accessibility={{ announcements, screenReaderInstructions: { draggable: engine.instructions } }}
        >
          <SortableContext items={ids} strategy={strategyFor(orientation)} disabled={disabled}>
            <div
              role="list"
              aria-label={label}
              data-slot="sortable"
              data-orientation={orientation}
              className={cn(
                orientation === "vertical" && "flex flex-col gap-2",
                orientation === "horizontal" && "flex flex-row flex-wrap gap-2",
                orientation === "grid" && "grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3",
                className
              )}
              {...props}
            >
              {children}
            </div>
          </SortableContext>
          {overlay ? <Overlay engine={engine} reduced={reduced} /> : null}
        </DndContext>
        <span data-slot="sortable-status" role="status" aria-live="polite" className="sr-only">
          {engine.spoken}
        </span>
      </LabelRegistry.Provider>
    </RootCtx.Provider>
  )
}

const LabelRegistry = React.createContext<React.MutableRefObject<Map<string, string>> | null>(null)

function Overlay({ engine, reduced }: { engine: ReturnType<typeof useEngineState>; reduced: boolean }) {
  const { activeId, renderers } = engine
  return (
    <DragOverlay dropAnimation={reduced ? null : { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }} zIndex={60}>
      {activeId ? renderers.current.get(activeId)?.() ?? null : null}
    </DragOverlay>
  )
}

/** After a move button changes the order, the browser may drop focus as the row moves; put it back on the same button. */
function useRefocusAfterMove(order: unknown) {
  const pending = React.useRef<string | null>(null)
  React.useEffect(() => {
    const target = pending.current
    if (!target) return
    pending.current = null
    Array.from(document.querySelectorAll<HTMLElement>("[data-sortable-move]"))
      .find((el) => el.dataset.sortableMove === target)
      ?.focus()
  }, [order])
  React.useEffect(() => {
    const onClick = (e: MouseEvent | KeyboardEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-sortable-move]")
      pending.current = el?.dataset.sortableMove ?? null
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])
}

// ---------------------------------------------------------------- SortableItem

type SortableItemProps = Omit<React.ComponentProps<"div">, "id"> & {
  /** The item's id, one of the ids in `value`. */
  id: string
  /** The item's name for screen readers: "Chorus". */
  label?: string
  /** Drag the whole item. Leave it off and add a `SortableHandle` for items that hold buttons, links or inputs. */
  dragEverywhere?: boolean
  disabled?: boolean
}

const itemBase =
  "relative flex min-w-0 items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-sm text-card-foreground shadow-xs outline-none transition-[box-shadow,border-color,opacity] duration-150 motion-reduce:transition-none"

function SortableItem({ id, label, dragEverywhere = false, disabled: itemDisabled, className, children, ...props }: SortableItemProps) {
  const root = useRoot()
  const labels = React.useContext(LabelRegistry)
  const name = label ?? root.labelOf(id)
  React.useEffect(() => {
    if (label && labels) labels.current.set(id, label)
    return () => {
      if (labels) labels.current.delete(id)
    }
  }, [id, label, labels])

  const sortable = useSortable({
    id,
    disabled: root.disabled || itemDisabled,
    transition: root.reduced ? null : { duration: 200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    animateLayoutChanges: root.reduced ? () => false : undefined,
  })
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = sortable

  // what the floating copy shows: the same content, drawn without the sortable hook
  const content = (
    <div data-slot="sortable-item" data-overlay="" role="listitem" className={cn(itemBase, "cursor-grabbing scale-[1.02] shadow-xl ring-1 ring-ring/30", className)} {...props}>
      <ItemCtx.Provider value={{ id, label: name, attributes: null, listeners: undefined, setActivatorNodeRef: null, dragging: true, overlay: true }}>{children}</ItemCtx.Provider>
    </div>
  )
  const latest = React.useRef(content)
  latest.current = content
  const { register } = root
  React.useEffect(() => register(id, () => latest.current), [register, id])

  const whole = dragEverywhere && !(root.disabled || itemDisabled)
  return (
    <div
      ref={setNodeRef}
      data-slot="sortable-item"
      data-dragging={isDragging || undefined}
      data-sortable-id={id}
      style={{ transform: DndCSS.Translate.toString(transform), transition }}
      className={cn(
        itemBase,
        whole && "cursor-grab touch-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing",
        "data-[dragging=true]:border-dashed data-[dragging=true]:opacity-40 data-[dragging=true]:shadow-none",
        className
      )}
      {...(whole ? { ...attributes, ...listeners, "aria-label": name, tabIndex: 0 } : {})}
      {...props}
      role="listitem"
    >
      <ItemCtx.Provider value={{ id, label: name, attributes, listeners, setActivatorNodeRef, dragging: isDragging, overlay: false }}>{children}</ItemCtx.Provider>
    </div>
  )
}

// ---------------------------------------------------------------- handle and move buttons

type SortableHandleProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Replace the grip icon. */
  children?: React.ReactNode
}

/** The grip that starts a drag. It is a button, so the keyboard can lift the item with Space or Enter. */
function SortableHandle({ className, children, "aria-label": ariaLabel, ...props }: SortableHandleProps) {
  const msg = useMessages()
  const item = useItem()
  const root = useRoot()
  const grip = children ?? <GripVertical className="size-4" aria-hidden="true" />
  const classes = cn(
    "inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
    className
  )
  if (item.overlay) {
    return (
      <span data-slot="sortable-handle" aria-hidden="true" className={cn(classes, "cursor-grabbing text-foreground")}>
        {grip}
      </span>
    )
  }
  return (
    <button
      type="button"
      data-slot="sortable-handle"
      ref={item.setActivatorNodeRef}
      disabled={root.disabled}
      aria-label={ariaLabel ?? msg("sortable.handle", "Reorder {item}", { item: item.label })}
      className={classes}
      {...item.attributes}
      {...item.listeners}
      {...props}
    >
      {grip}
    </button>
  )
}

type SortableMoveProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Which way the item goes: toward the start of the list, or toward the end. */
  direction: "previous" | "next"
  children?: React.ReactNode
}

/**
 * A plain button that moves the item one place. Dragging is hard or impossible for some people, so give them this too.
 */
function SortableMove({ direction, className, children, "aria-label": ariaLabel, ...props }: SortableMoveProps) {
  const msg = useMessages()
  const item = useItem()
  const root = useRoot()
  if (item.overlay) return null
  const place = root.locate(item.id)
  const atEdge = !place || (direction === "previous" ? place.index === 0 : place.index === place.count - 1)
  const vertical = root.orientation === "vertical"
  const Icon = vertical ? (direction === "previous" ? ChevronUp : ChevronDown) : direction === "previous" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      data-slot="sortable-move"
      data-sortable-move={`${item.id}:${direction}`}
      disabled={root.disabled || atEdge}
      onClick={() => root.move(item.id, direction === "previous" ? -1 : 1)}
      aria-label={ariaLabel ?? (direction === "previous" ? msg("sortable.moveEarlier", "Move {item} earlier", { item: item.label }) : msg("sortable.moveLater", "Move {item} later", { item: item.label }))}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none",
        !vertical && "rtl:rotate-180",
        className
      )}
      {...props}
    >
      {children ?? <Icon className="size-4" aria-hidden="true" />}
    </button>
  )
}

// ---------------------------------------------------------------- SortableGroups: several lists, items move between them

type SortableGroupsValue = Record<string, string[]>
type SortableGroupsInfo = { activeId: string; fromGroup: string; toGroup: string; from: number; to: number }

type SortableGroupsProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** The ids in each group: `{ todo: ["a", "b"], doing: ["c"] }`. The object's key order is the order of the groups. */
  value: SortableGroupsValue
  /** Called with the new arrangement when an item is dropped or moved with a button. Keep it in state and render the items from it. */
  onValueChange: (groups: SortableGroupsValue, info: SortableGroupsInfo) => void
  /** What the set of lists is: "Board". */
  label: string
  getLabel?: (id: string) => string
  /** Says a group's name in announcements. Defaults to the group id. */
  getGroupLabel?: (groupId: string) => string
  /** Orientation of the items inside each group. */
  orientation?: SortableOrientation
  disabled?: boolean
  children: React.ReactNode
}

/** Several lists that share items: drag a card from one column to another, by pointer, touch or keyboard. */
function SortableGroups({
  value: groups,
  onValueChange,
  label,
  getLabel,
  getGroupLabel,
  orientation = "vertical",
  disabled = false,
  className,
  children,
  ...props
}: SortableGroupsProps) {
  const dir = useDirection()
  const reduced = !!useReducedMotion()
  // while an item is carried between lists the new arrangement is held here, and only given to the caller when it is dropped
  const [draft, setDraft] = React.useState<SortableGroupsValue | null>(null)
  const current = draft ?? groups
  const labels = React.useRef(new Map<string, string>())
  const labelOf = React.useCallback((id: string) => getLabel?.(id) ?? labels.current.get(id) ?? id, [getLabel])
  const groupLabel = (g: string) => getGroupLabel?.(g) ?? g
  const engine = useEngineState(labelOf)
  const { msg, activeId, setActiveId } = engine
  const sensors = useSortableSensors()
  const origin = React.useRef<{ group: string; index: number } | null>(null)

  const groupOf = (id: UniqueIdentifier, from: SortableGroupsValue = current) => (id in from ? String(id) : Object.keys(from).find((g) => from[g]!.includes(String(id))))
  const commit = (next: SortableGroupsValue, info: SortableGroupsInfo) => onValueChange(next, info)

  const collision: CollisionDetection = (args) => {
    const pointer = pointerWithin(args)
    const hits = pointer.length ? pointer : rectIntersection(args)
    return hits.length ? hits : closestCorners(args)
  }

  const spot = (id: UniqueIdentifier) => {
    const g = groupOf(id)
    return g ? { group: g, position: String(id) in current ? current[String(id)]!.length : current[g]!.indexOf(String(id)) + 1, total: current[g]!.length } : null
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const s = spot(active.id)
      return s ? msg("sortable.groupPickedUp", "Picked up {item} from {group}. It is position {position} of {total}.", { item: labelOf(String(active.id)), group: groupLabel(s.group), position: s.position, total: s.total }) : undefined
    },
    onDragOver: ({ active, over }) => {
      const s = over ? spot(over.id) : null
      return s ? msg("sortable.groupOver", "{item} is over {group}, position {position} of {total}.", { item: labelOf(String(active.id)), group: groupLabel(s.group), position: Math.max(1, s.position), total: s.total }) : undefined
    },
    onDragEnd: ({ active }) => {
      const s = spot(active.id)
      return s ? msg("sortable.groupDropped", "Dropped {item} in {group} at position {position} of {total}.", { item: labelOf(String(active.id)), group: groupLabel(s.group), position: s.position, total: s.total }) : undefined
    },
    onDragCancel: ({ active }) => msg("sortable.groupCancelled", "Cancelled. {item} went back to {group}.", { item: labelOf(String(active.id)), group: groupLabel(origin.current?.group ?? "") }),
  }

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id)
    setActiveId(id)
    const g = groupOf(id)
    origin.current = g ? { group: g, index: current[g]!.indexOf(id) } : null
  }

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const from = groupOf(active.id)
    const to = groupOf(over.id)
    if (!from || !to || from === to) return
    const base = draft ?? groups
    const fromList = base[from]!
    const toList = base[to]!
    const activeIndex = fromList.indexOf(String(active.id))
    const overIndex = String(over.id) in base ? toList.length : toList.indexOf(String(over.id))
    const rect = active.rect.current.translated
    const below = rect && over.rect ? (orientation === "horizontal" ? rect.left > over.rect.left + over.rect.width / 2 : rect.top > over.rect.top + over.rect.height / 2) : false
    const at = overIndex < 0 ? toList.length : overIndex + (String(over.id) in base ? 0 : below ? 1 : 0)
    setDraft({
      ...base,
      [from]: fromList.filter((x) => x !== String(active.id)),
      [to]: [...toList.slice(0, at), fromList[activeIndex]!, ...toList.slice(at)],
    })
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    const start = origin.current
    origin.current = null
    let next = draft ?? groups
    setDraft(null)
    if (over && start) {
      const g = groupOf(active.id, next)
      const overGroup = groupOf(over.id, next)
      if (g && overGroup === g && active.id !== over.id) {
        const list = next[g]!
        const from = list.indexOf(String(active.id))
        const to = String(over.id) in next ? list.length - 1 : list.indexOf(String(over.id))
        if (from >= 0 && to >= 0) next = { ...next, [g]: arrayMove(list, from, to) }
      }
    }
    const end = groupOf(active.id, next)
    if (!start || !end) return
    const index = next[end]!.indexOf(String(active.id))
    if (end === start.group && index === start.index) return
    commit(next, { activeId: String(active.id), fromGroup: start.group, toGroup: end, from: start.index, to: index })
  }

  const move = React.useCallback(
    (id: string, delta: -1 | 1) => {
      const g = groupOf(id, groups)
      if (!g) return
      const list = groups[g]!
      const from = list.indexOf(id)
      const to = from + delta
      if (to < 0 || to >= list.length) return
      commit({ ...groups, [g]: arrayMove(list, from, to) }, { activeId: id, fromGroup: g, toGroup: g, from, to })
      engine.setSpoken(msg("sortable.groupMoved", "Moved {item} to position {position} of {total} in {group}.", { item: labelOf(id), position: to + 1, total: list.length, group: groupLabel(g) }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups, labelOf]
  )
  useRefocusAfterMove(groups)

  const ctx: RootContext = {
    orientation,
    disabled,
    reduced,
    rtl: dir === "rtl",
    labelOf,
    locate: (id) => {
      const g = groupOf(id)
      return g ? { group: g, index: current[g]!.indexOf(id), count: current[g]!.length } : null
    },
    move,
    register: engine.register,
    activeId,
  }

  return (
    <RootCtx.Provider value={ctx}>
      <LabelRegistry.Provider value={labels}>
        <GroupsCtx.Provider value={{ groups: current, groupLabel }}>
          <DndContext
            sensors={sensors}
            collisionDetection={collision}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
              setActiveId(null)
              setDraft(null)
            }}
            accessibility={{ announcements, screenReaderInstructions: { draggable: engine.instructions } }}
          >
            <div role="group" aria-label={label} data-slot="sortable-groups" className={cn("flex items-start gap-4 overflow-x-auto", className)} {...props}>
              {children}
            </div>
            <Overlay engine={engine} reduced={reduced} />
          </DndContext>
          <span data-slot="sortable-status" role="status" aria-live="polite" className="sr-only">
            {engine.spoken}
          </span>
        </GroupsCtx.Provider>
      </LabelRegistry.Provider>
    </RootCtx.Provider>
  )
}

const GroupsCtx = React.createContext<{ groups: SortableGroupsValue; groupLabel: (g: string) => string } | null>(null)

type SortableGroupProps = Omit<React.ComponentProps<"div">, "id"> & {
  /** The group's key in `value`. */
  id: string
  /** The group's name for screen readers. Defaults to `getGroupLabel(id)`. */
  label?: string
}

/** One list inside `SortableGroups`. Put `SortableItem`s in it. An empty group still accepts drops. */
function SortableGroup({ id, label, className, children, ...props }: SortableGroupProps) {
  const root = useRoot()
  const g = React.useContext(GroupsCtx)
  if (!g) throw new Error("SortableGroup must be used inside <SortableGroups>.")
  const ids = g.groups[id] ?? []
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <SortableContext items={ids} strategy={strategyFor(root.orientation)} disabled={root.disabled}>
      <div
        ref={setNodeRef}
        role="list"
        aria-label={label ?? g.groupLabel(id)}
        data-slot="sortable-group"
        data-over={isOver || undefined}
        className={cn(
          "flex min-h-24 min-w-0 flex-1 gap-2 rounded-xl border border-dashed bg-muted/40 p-2 transition-colors data-[over=true]:border-ring data-[over=true]:bg-accent/60 motion-reduce:transition-none",
          root.orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SortableContext>
  )
}

export {
  Sortable,
  SortableGroup,
  SortableGroups,
  SortableHandle,
  SortableItem,
  SortableMove,
  type SortableGroupProps,
  type SortableGroupsInfo,
  type SortableGroupsProps,
  type SortableGroupsValue,
  type SortableHandleProps,
  type SortableInfo,
  type SortableItemProps,
  type SortableMoveProps,
  type SortableOrientation,
  type SortableProps,
}
