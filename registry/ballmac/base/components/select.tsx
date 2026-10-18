// Ballmac UI: Select. https://ui.ballmac.com/components/select
// Based on shadcn/ui's Select (MIT, Copyright (c) 2023 shadcn), restyled with trigger sizes and tw-animate-css transitions.
"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { DirectionProvider, useDirection } from "@/lib/ballmac/direction"
import { splitPositioner } from "@/lib/ballmac/positioner"
import { cn } from "@/lib/utils"

/**
 * Base UI shows the chosen item in the trigger from an `items` map (value to label), because the list is not mounted while it is closed. So that
 * `<Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">Apple</SelectItem>…` keeps working as it does with Radix UI, the
 * map is read from the SelectItem elements inside the children. Items hidden inside your own components cannot be found: pass `items` yourself then.
 */
function collectItems(children: React.ReactNode, out: Record<string, React.ReactNode> = {}): Record<string, React.ReactNode> {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<{ children?: React.ReactNode; value?: unknown }>(child)) return
    if (child.type === SelectItem && typeof child.props.value === "string") out[child.props.value] = child.props.children
    else if (child.props.children) collectItems(child.props.children, out)
  })
  return out
}

type SelectProps = Omit<React.ComponentProps<typeof SelectPrimitive.Root>, "value" | "defaultValue" | "onValueChange" | "multiple"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl"
}

function Select({ children, items, dir: dirProp, onValueChange, ...props }: SelectProps) {
  const dir = useDirection(dirProp)
  const found = React.useMemo(() => items ?? collectItems(children), [items, children])
  return (
    <DirectionProvider dir={dir}>
      <SelectPrimitive.Root data-slot="select" items={found} onValueChange={(v) => onValueChange?.(v == null ? "" : String(v))} {...props}>
        {children}
      </SelectPrimitive.Root>
    </DirectionProvider>
  )
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

type SelectTriggerProps = Omit<React.ComponentProps<typeof SelectPrimitive.Trigger>, "className"> & {
  className?: string
  /** Matches Input and Button heights: sm is h-8, default is h-9. */
  size?: "sm" | "default"
}

function SelectTrigger({ className, size = "default", children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit min-w-0 items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 dark:bg-input/30 dark:hover:bg-input/50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
        "data-[size=default]:h-[var(--bm-control-h,calc(var(--spacing)*9))] data-[size=sm]:h-[var(--bm-control-h-sm,calc(var(--spacing)*8))] data-[size=sm]:px-2.5 data-[size=sm]:text-[13px]",
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="flex">
        <ChevronDownIcon className="size-4 opacity-60" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = Omit<React.ComponentProps<typeof SelectPrimitive.Popup>, "className"> &
  Pick<React.ComponentProps<typeof SelectPrimitive.Positioner>, "side" | "alignOffset" | "collisionPadding"> & {
    className?: string
    align?: "start" | "center" | "end"
    /** "popper" opens below the trigger like a menu; "item-aligned" overlaps the trigger like a native select. */
    position?: "popper" | "item-aligned"
    /** Distance in px from the trigger when position is "popper". */
    sideOffset?: number
  }

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...rest
}: SelectContentProps) {
  const [placement, props] = splitPositioner(rest)
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        alignItemWithTrigger={position === "item-aligned"}
        align={align}
        sideOffset={position === "popper" ? sideOffset : 0}
        className="z-50 outline-none"
        {...placement}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative flex max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) flex-col overflow-hidden rounded-lg border bg-popover/[var(--bm-material-alpha,100%)] backdrop-blur-[var(--bm-material-blur,0px)] text-popover-foreground shadow-[0_8px_24px_-6px_rgb(0_0_0/0.18),0_2px_6px_-2px_rgb(0_0_0/0.08)]",
            "transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
            position === "popper" && "min-w-(--anchor-width)",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="min-h-0 flex-1 overflow-y-auto p-1 outline-none">{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: Omit<React.ComponentProps<typeof SelectPrimitive.GroupLabel>, "className"> & { className?: string }) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "className"> & { className?: string }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pe-8 ps-2 text-sm outline-hidden",
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span data-slot="select-item-indicator" className="absolute end-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-foreground" aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: Omit<React.ComponentProps<typeof SelectPrimitive.Separator>, "className"> & { className?: string }) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({ className, ...props }: Omit<React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>, "className"> & { className?: string }) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1 text-muted-foreground", className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" aria-hidden="true" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({ className, ...props }: Omit<React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>, "className"> & { className?: string }) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1 text-muted-foreground", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" aria-hidden="true" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectContentProps,
  type SelectProps,
  type SelectTriggerProps,
}
