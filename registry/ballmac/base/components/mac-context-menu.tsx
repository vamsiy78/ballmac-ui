// Ballmac UI: Mac Context Menu. https://ui.ballmac.com/components/mac-context-menu
"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"
import { ContextMenu as Primitive } from "@base-ui/react/context-menu"

import { DirectionProvider, useDirection } from "@/lib/ballmac/direction"
import { selectHandler, splitPositioner } from "@/lib/ballmac/positioner"

import { cn } from "@/lib/utils"

const content =
  "min-w-[13.5rem] overflow-hidden rounded-[10px] border border-foreground/10 bg-popover/80 p-1.5 text-[13px] text-popover-foreground shadow-[0_12px_40px_-8px_rgb(0_0_0/0.35),0_2px_8px_rgb(0_0_0/0.12)] backdrop-blur-2xl backdrop-saturate-150 outline-none dark:bg-popover/70 [--mac-accent:oklch(0.53_0.2_258)] origin-(--transform-origin) transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none"

const item =
  "relative flex h-[22px] cursor-default items-center gap-2 rounded-[5px] pe-2.5 ps-[22px] outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-foreground/35 data-[highlighted]:bg-(--mac-accent) data-[highlighted]:text-white [&_svg]:size-3.5 [&_svg]:shrink-0"

function MacContextMenu({ dir: dirProp, ...props }: React.ComponentProps<typeof Primitive.Root> & { dir?: "ltr" | "rtl" }) {
  const dir = useDirection(dirProp)
  return (
    <DirectionProvider dir={dir}>
      <Primitive.Root {...props} />
    </DirectionProvider>
  )
}

function MacContextMenuTrigger({ className, ...props }: Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & { className?: string }) {
  return <Primitive.Trigger data-slot="mac-context-menu-trigger" className={className} {...props} />
}

type PositionProps = Pick<React.ComponentProps<typeof Primitive.Positioner>, "side" | "align" | "alignOffset" | "collisionPadding">

function MacContextMenuContent({ className, ...rest }: Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> & PositionProps & { className?: string }) {
  const [position, props] = splitPositioner(rest)
  return (
    <Primitive.Portal>
      <Primitive.Positioner collisionPadding={8} className="z-50 outline-none" {...position}>
        <Primitive.Popup data-slot="mac-context-menu-content" className={cn(content, className)} {...props} />
      </Primitive.Positioner>
    </Primitive.Portal>
  )
}

type MacContextMenuItemProps = Omit<React.ComponentProps<typeof Primitive.Item>, "className"> & {
  className?: string
  /** Called when the item is chosen, with the pointer or the keyboard. */
  onSelect?: (event: Event) => void
  /** Leading icon, drawn in the left gutter. */
  icon?: React.ReactNode
  /** Key equivalent shown at the right, such as ⌘C. */
  shortcut?: string
  /** Destructive items turn red until highlighted. */
  destructive?: boolean
}

function MacContextMenuItem({ icon, shortcut, destructive, className, children, onSelect, onClick, ...props }: MacContextMenuItemProps) {
  return (
    <Primitive.Item data-slot="mac-context-menu-item" onClick={selectHandler(onSelect, onClick as never) as never} data-destructive={destructive ? "" : undefined} className={cn(item, icon && "ps-[30px]", destructive && "text-destructive data-[highlighted]:text-white", className)} {...props}>
      {icon && <span aria-hidden="true" className="absolute start-2 flex items-center">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && <MacContextMenuShortcut>{shortcut}</MacContextMenuShortcut>}
    </Primitive.Item>
  )
}

function MacContextMenuCheckboxItem({ className, children, shortcut, onSelect, ...props }: Omit<React.ComponentProps<typeof Primitive.CheckboxItem>, "className" | "onClick"> & { className?: string; shortcut?: string; onSelect?: (event: Event) => void }) {
  return (
    <Primitive.CheckboxItem data-slot="mac-context-menu-checkbox-item" onClick={selectHandler(onSelect) as never} className={cn(item, className)} {...props}>
      <Primitive.CheckboxItemIndicator className="absolute start-1.5 flex items-center">
        <Check aria-hidden="true" strokeWidth={3} />
      </Primitive.CheckboxItemIndicator>
      <span className="flex-1 truncate">{children}</span>
      {shortcut && <MacContextMenuShortcut>{shortcut}</MacContextMenuShortcut>}
    </Primitive.CheckboxItem>
  )
}

function MacContextMenuRadioGroup({ onValueChange, ...props }: Omit<React.ComponentProps<typeof Primitive.RadioGroup>, "onValueChange"> & { onValueChange?: (value: string) => void }) {
  return <Primitive.RadioGroup onValueChange={(v) => onValueChange?.(String(v))} {...props} />
}

function MacContextMenuRadioItem({ className, children, onSelect, ...props }: Omit<React.ComponentProps<typeof Primitive.RadioItem>, "className" | "onClick"> & { className?: string; onSelect?: (event: Event) => void }) {
  return (
    <Primitive.RadioItem data-slot="mac-context-menu-radio-item" onClick={selectHandler(onSelect) as never} className={cn(item, className)} {...props}>
      <Primitive.RadioItemIndicator className="absolute start-1.5 flex items-center">
        <Check aria-hidden="true" strokeWidth={3} />
      </Primitive.RadioItemIndicator>
      <span className="flex-1 truncate">{children}</span>
    </Primitive.RadioItem>
  )
}

function MacContextMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="mac-context-menu-label" className={cn("px-[22px] pt-1 pb-0.5 text-[11px] font-semibold text-muted-foreground", className)} {...props} />
}

function MacContextMenuSeparator({ className, ...props }: Omit<React.ComponentProps<typeof Primitive.Separator>, "className"> & { className?: string }) {
  return <Primitive.Separator data-slot="mac-context-menu-separator" className={cn("mx-2.5 my-1 h-px bg-foreground/12", className)} {...props} />
}

function MacContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="mac-context-menu-shortcut" aria-hidden="true" className={cn("ms-6 text-[12px] tracking-wide text-muted-foreground group-data-[highlighted]:text-white/80 [[data-highlighted]_&]:text-white/80", className)} {...props} />
}

function MacContextMenuSub(props: React.ComponentProps<typeof Primitive.SubmenuRoot>) {
  return <Primitive.SubmenuRoot {...props} />
}

function MacContextMenuSubTrigger({ className, children, icon, ...props }: Omit<React.ComponentProps<typeof Primitive.SubmenuTrigger>, "className"> & { className?: string; icon?: React.ReactNode }) {
  return (
    <Primitive.SubmenuTrigger data-slot="mac-context-menu-sub-trigger" className={cn(item, icon && "ps-[30px]", "data-popup-open:bg-foreground/10", className)} {...props}>
      {icon && <span aria-hidden="true" className="absolute start-2 flex items-center">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      <ChevronRight aria-hidden="true" className="ms-4 -me-1 rtl:rotate-180" strokeWidth={2.5} />
    </Primitive.SubmenuTrigger>
  )
}

function MacContextMenuSubContent({ className, ...rest }: Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> & PositionProps & { className?: string }) {
  const [position, props] = splitPositioner(rest)
  return (
    <Primitive.Portal>
      <Primitive.Positioner collisionPadding={8} className="z-50 outline-none" {...position}>
        <Primitive.Popup data-slot="mac-context-menu-sub-content" className={cn(content, "shadow-lg", className)} {...props} />
      </Primitive.Positioner>
    </Primitive.Portal>
  )
}

export {
  MacContextMenu,
  MacContextMenuTrigger,
  MacContextMenuContent,
  MacContextMenuItem,
  MacContextMenuCheckboxItem,
  MacContextMenuRadioGroup,
  MacContextMenuRadioItem,
  MacContextMenuLabel,
  MacContextMenuSeparator,
  MacContextMenuShortcut,
  MacContextMenuSub,
  MacContextMenuSubTrigger,
  MacContextMenuSubContent,
  type MacContextMenuItemProps,
}
