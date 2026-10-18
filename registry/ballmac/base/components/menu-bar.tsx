// Ballmac UI: Menu Bar. https://ui.ballmac.com/components/menu-bar
"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Menubar as BarPrimitive } from "@base-ui/react/menubar"

import { DirectionProvider, useDirection } from "@/lib/ballmac/direction"
import { MenubarValue, useMenuValue } from "@/lib/ballmac/menubar-value"
import { selectHandler, splitPositioner } from "@/lib/ballmac/positioner"
import { cn } from "@/lib/utils"

type MenuBarProps = Omit<React.ComponentProps<typeof BarPrimitive>, "className" | "style"> & {
  className?: string
  style?: React.CSSProperties
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl"
  /** The open menu, by its `value`. Controls the bar. */
  value?: string
  /** The menu that starts open. */
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/**
 * A macOS menu bar built on Base UI Menubar: arrow keys move between menus and items, typeahead,
 * Escape closes. Put MenuBarMenu children first and a MenuBarStatus area last. The status area is
 * rendered beside the ARIA menubar (not inside it), since a menubar may only contain menu items.
 */
function MenuBar({ className, children, style, dir: dirProp, value, defaultValue, onValueChange, ...props }: MenuBarProps) {
  const dir = useDirection(dirProp)
  const all = React.Children.toArray(children)
  const isStatus = (c: React.ReactNode) => React.isValidElement(c) && c.type === MenuBarStatus
  return (
    <div
      data-slot="menu-bar"
      style={style}
      className={cn(
        "flex h-7 w-full min-w-0 items-center px-2 text-[13px] text-foreground select-none",
        "border-b border-white/20 bg-background/55 shadow-[0_0.5px_0_0_rgb(0_0_0/0.08)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.06] dark:bg-background/45",
        className
      )}
    >
      <DirectionProvider dir={dir}>
        <MenubarValue value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <BarPrimitive dir={dir} data-slot="menu-bar-menus" className="flex min-w-0 items-center gap-0.5" {...props}>
          {all.filter((c) => !isStatus(c))}
        </BarPrimitive>
        </MenubarValue>
      </DirectionProvider>
      {all.filter(isStatus)}
    </div>
  )
}

function MenuBarMenu({ value, ...props }: React.ComponentProps<typeof MenuPrimitive.Root> & { value?: string }) {
  return <MenuPrimitive.Root {...useMenuValue(value)} {...props} />
}

function MenuBarGroup(props: React.ComponentProps<typeof MenuPrimitive.Group>) {
  return <MenuPrimitive.Group data-slot="menu-bar-group" {...props} />
}

function MenuBarSub(props: React.ComponentProps<typeof MenuPrimitive.SubmenuRoot>) {
  return <MenuPrimitive.SubmenuRoot {...props} />
}

type MenuBarTriggerProps = Omit<React.ComponentProps<typeof MenuPrimitive.Trigger>, "className"> & {
  className?: string
  /** "app" sets the trigger in bold, like the application menu next to the logo. */
  variant?: "default" | "app"
}

function MenuBarTrigger({ variant = "default", className, ...props }: MenuBarTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menu-bar-trigger"
      className={cn(
        "flex h-[22px] shrink-0 items-center gap-1.5 rounded-[5px] px-2 outline-none transition-colors duration-75",
        "hover:bg-foreground/[0.08] focus-visible:bg-foreground/[0.1] data-popup-open:bg-foreground/[0.12] [&_svg]:size-3.5 [&_svg]:shrink-0",
        variant === "app" ? "font-bold" : "font-normal",
        className
      )}
      {...props}
    />
  )
}

const menuSurface =
  "min-w-[14rem] overflow-hidden rounded-[10px] border border-foreground/10 bg-popover/80 p-[5px] text-[13px] text-popover-foreground shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_12px_32px_-8px_rgb(0_0_0/0.35)] backdrop-blur-2xl backdrop-saturate-150 outline-none dark:bg-popover/75 dark:shadow-[0_0_0_0.5px_rgb(0_0_0/0.8),0_12px_32px_-8px_rgb(0_0_0/0.7)] origin-(--transform-origin) transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none"

/** Base UI always renders a menu through a Portal. With `portal={false}` the portal's container is an element right here, so the menu stays inside its parent. */
function MenuPortal({ portal, children }: { portal: boolean; children: React.ReactNode }) {
  const [host, setHost] = React.useState<HTMLElement | null>(null)
  if (portal) return <MenuPrimitive.Portal>{children}</MenuPrimitive.Portal>
  return (
    <>
      <span ref={setHost} data-slot="menu-bar-portal" className="contents" />
      {host ? <MenuPrimitive.Portal container={host}>{children}</MenuPrimitive.Portal> : null}
    </>
  )
}

type PositionProps = Pick<React.ComponentProps<typeof MenuPrimitive.Positioner>, "side" | "align" | "alignOffset" | "collisionPadding" | "sideOffset">

type MenuBarContentProps = Omit<React.ComponentProps<typeof MenuPrimitive.Popup>, "className"> & PositionProps & {
  className?: string
  /** Render into a portal on document.body (default). Set false to keep the menu inside its container, e.g. in a mockup. */
  portal?: boolean
}

function MenuBarContent({ portal = true, className, align = "start", alignOffset = -4, sideOffset = 4, ...rest }: MenuBarContentProps) {
  const [position, props] = splitPositioner(rest)
  const content = (
    <MenuPrimitive.Positioner align={align} alignOffset={alignOffset} sideOffset={sideOffset} collisionPadding={8} className="z-50 outline-none" {...position}>
      <MenuPrimitive.Popup data-slot="menu-bar-content" className={cn(menuSurface, className)} {...props} />
    </MenuPrimitive.Positioner>
  )
  return <MenuPortal portal={portal}>{content}</MenuPortal>
}

const itemClasses =
  "relative flex h-[22px] cursor-default items-center gap-2 rounded-[5px] px-2 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-foreground/35 data-[highlighted]:bg-ring data-[highlighted]:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"

type MenuBarItemProps = Omit<React.ComponentProps<typeof MenuPrimitive.Item>, "className"> & {
  className?: string
  /** Called when the item is chosen, with the pointer or the keyboard. */
  onSelect?: (event: Event) => void
  /** Indent the label to line up with checkbox items. */
  inset?: boolean
  /** Red text for destructive actions. */
  variant?: "default" | "destructive"
}

function MenuBarItem({ inset, variant = "default", className, onSelect, onClick, ...props }: MenuBarItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-bar-item"
      onClick={selectHandler(onSelect, onClick as never) as never}
      data-variant={variant}
      className={cn(itemClasses, inset && "ps-6", variant === "destructive" && "text-destructive", "group/menu-item", className)}
      {...props}
    />
  )
}

function MenuBarCheckboxItem({ className, children, onSelect, ...props }: Omit<React.ComponentProps<typeof MenuPrimitive.CheckboxItem>, "className" | "onClick"> & { className?: string; onSelect?: (event: Event) => void }) {
  return (
    <MenuPrimitive.CheckboxItem data-slot="menu-bar-checkbox-item" onClick={selectHandler(onSelect) as never} className={cn(itemClasses, "group/menu-item ps-6", className)} {...props}>
      <span className="absolute start-1.5 flex size-3.5 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-3" strokeWidth={2.5} aria-hidden="true" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenuBarLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="menu-bar-label"
      className={cn("px-2 pt-1.5 pb-0.5 text-[11px] font-semibold text-muted-foreground", className)}
      {...props}
    />
  )
}

function MenuBarSeparator({ className, ...props }: Omit<React.ComponentProps<typeof MenuPrimitive.Separator>, "className"> & { className?: string }) {
  return <MenuPrimitive.Separator data-slot="menu-bar-separator" className={cn("mx-2 my-[5px] h-px bg-foreground/10", className)} {...props} />
}

type MenuBarShortcutProps = React.ComponentProps<"span">

/** Right-aligned key equivalent, e.g. "⇧⌘N". Plain text, so it is part of the item's accessible name. */
function MenuBarShortcut({ className, ...props }: MenuBarShortcutProps) {
  return (
    <span
      data-slot="menu-bar-shortcut"
      className={cn("ms-auto ps-6 font-sans text-[12px] tracking-[0.12em] text-muted-foreground group-data-[highlighted]/menu-item:text-white/90", className)}
      {...props}
    />
  )
}

function MenuBarSubTrigger({ className, children, ...props }: Omit<React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger>, "className"> & { className?: string }) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="menu-bar-sub-trigger"
      className={cn(itemClasses, "data-popup-open:bg-foreground/10 data-popup-open:data-[highlighted]:bg-ring", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto size-3.5 opacity-60" aria-hidden="true" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

type MenuBarSubContentProps = Omit<React.ComponentProps<typeof MenuPrimitive.Popup>, "className"> & PositionProps & {
  className?: string
  /** Render into a portal on document.body (default). */
  portal?: boolean
}

function MenuBarSubContent({ portal = true, className, sideOffset = 2, ...rest }: MenuBarSubContentProps) {
  const [position, props] = splitPositioner(rest)
  const content = (
    <MenuPrimitive.Positioner sideOffset={sideOffset} collisionPadding={8} className="z-50 outline-none" {...position}>
      <MenuPrimitive.Popup data-slot="menu-bar-sub-content" className={cn(menuSurface, "min-w-[10rem]", className)} {...props} />
    </MenuPrimitive.Positioner>
  )
  return <MenuPortal portal={portal}>{content}</MenuPortal>
}

type MenuBarStatusProps = React.ComponentProps<"div">

/** The right side of the bar: status icons and the clock. */
function MenuBarStatus({ className, ...props }: MenuBarStatusProps) {
  return <div data-slot="menu-bar-status" className={cn("ms-auto flex shrink-0 items-center gap-0.5", className)} {...props} />
}

type MenuBarStatusItemProps = React.ComponentProps<"button">

/** An icon button in the status area. Give it an aria-label. */
function MenuBarStatusItem({ className, type = "button", ...props }: MenuBarStatusItemProps) {
  return (
    <button
      type={type}
      data-slot="menu-bar-status-item"
      className={cn(
        "flex h-[22px] min-w-[26px] shrink-0 items-center justify-center gap-1 rounded-[5px] px-1.5 outline-none transition-colors duration-75 hover:bg-foreground/[0.08] focus-visible:ring-2 focus-visible:ring-ring/60 [&_svg]:size-[15px] [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

type MenuBarClockProps = Omit<React.ComponentProps<"time">, "children"> & {
  /** BCP 47 locale for formatting. Fixed by default so server and browser agree. */
  locale?: string
  /** Intl options. Default: short weekday, month, day, and hour:minute. */
  format?: Intl.DateTimeFormatOptions
  /** Show a fixed time instead of the live clock (useful for mockups and screenshots). */
  value?: Date
}

const defaultClockFormat: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }

/**
 * A live clock that ticks each minute. It renders nothing time-specific on the server and fills in after
 * mount, so it never causes a hydration mismatch.
 */
function MenuBarClock({ locale = "en-US", format = defaultClockFormat, value, className, ...props }: MenuBarClockProps) {
  const fixed = value?.getTime()
  const [now, setNow] = React.useState<Date | null>(value ?? null)

  React.useEffect(() => {
    if (fixed !== undefined) {
      setNow(new Date(fixed))
      return
    }
    setNow(new Date())
    let interval: number | undefined
    const timeout = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [fixed])

  const text = now ? new Intl.DateTimeFormat(locale, format).format(now).replace(/,/g, "") : ""
  return (
    <time
      data-slot="menu-bar-clock"
      dateTime={now?.toISOString()}
      className={cn("inline-flex h-[22px] min-w-[4.5rem] shrink-0 items-center justify-end px-1.5 tabular-nums", className)}
      {...props}
    >
      {text}
    </time>
  )
}

export {
  MenuBar,
  MenuBarCheckboxItem,
  MenuBarClock,
  MenuBarContent,
  MenuBarGroup,
  MenuBarItem,
  MenuBarLabel,
  MenuBarMenu,
  MenuBarSeparator,
  MenuBarShortcut,
  MenuBarStatus,
  MenuBarStatusItem,
  MenuBarSub,
  MenuBarSubContent,
  MenuBarSubTrigger,
  MenuBarTrigger,
  type MenuBarClockProps,
  type MenuBarContentProps,
  type MenuBarItemProps,
  type MenuBarProps,
  type MenuBarShortcutProps,
  type MenuBarStatusItemProps,
  type MenuBarStatusProps,
  type MenuBarSubContentProps,
  type MenuBarTriggerProps,
}
