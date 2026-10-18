// Ballmac UI: Menubar. https://ui.ballmac.com/components/menubar
// Based on shadcn/ui Menubar (MIT, Copyright (c) 2023 shadcn), restyled with tokens, destructive and inset items, and a shortcut slot.
"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { Menu as Primitive } from "@base-ui/react/menu";
import { Menubar as Bar } from "@base-ui/react/menubar";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { MenubarValue, useMenuValue } from "@/lib/ballmac/menubar-value";
import { selectHandler, splitPositioner } from "@/lib/ballmac/positioner";
import { cn } from "@/lib/utils";

const itemBase =
  "relative flex min-h-[var(--bm-menu-item-h,2rem)] cursor-default select-none items-center gap-2 rounded-[var(--bm-menu-item-radius,var(--radius-md))] px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

const surface =
  "min-w-[12rem] origin-(--transform-origin) overflow-hidden rounded-xl border bg-popover/[var(--bm-material-alpha,100%)] backdrop-blur-[var(--bm-material-blur,0px)] p-[var(--bm-menu-pad,0.25rem)] text-popover-foreground shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))] transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none";

type MenubarProps = Omit<React.ComponentProps<typeof Bar>, "className"> & {
  className?: string;
  /** The open menu, by its `value`. Controls the bar. */
  value?: string;
  /** The menu that starts open. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl";
};
/** The horizontal bar. Arrow keys move between menus; Enter or ArrowDown opens one. */
function Menubar({ className, dir: dirProp, value, defaultValue, onValueChange, ...props }: MenubarProps) {
  const dir = useDirection(dirProp);
  return (
    <DirectionProvider dir={dir}>
      <MenubarValue value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
      <Bar
        dir={dir}
        data-slot="menubar"
        className={cn(
          "flex h-9 w-fit items-center gap-1 rounded-lg border bg-background p-1 shadow-xs",
          className,
        )}
        {...props}
      />
      </MenubarValue>
    </DirectionProvider>
  );
}

type MenubarMenuProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Names the menu for the bar's `value`, `defaultValue` and `onValueChange`. */
  value?: string;
};
function MenubarMenu({ value, ...props }: MenubarMenuProps) {
  return <Primitive.Root {...useMenuValue(value)} {...props} />;
}

type MenubarGroupProps = React.ComponentProps<typeof Primitive.Group>;
function MenubarGroup(props: MenubarGroupProps) {
  return <Primitive.Group data-slot="menubar-group" {...props} />;
}

type MenubarSubProps = React.ComponentProps<typeof Primitive.SubmenuRoot>;
function MenubarSub(props: MenubarSubProps) {
  return <Primitive.SubmenuRoot {...props} />;
}

type MenubarRadioGroupProps = Omit<React.ComponentProps<typeof Primitive.RadioGroup>, "onValueChange"> & {
  onValueChange?: (value: string) => void;
};
function MenubarRadioGroup({ onValueChange, ...props }: MenubarRadioGroupProps) {
  return (
    <Primitive.RadioGroup data-slot="menubar-radio-group" onValueChange={(v) => onValueChange?.(String(v))} {...props} />
  );
}

type MenubarTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & { className?: string };
function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex h-7 select-none items-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-popup-open:bg-accent data-popup-open:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

type PositionProps = Pick<React.ComponentProps<typeof Primitive.Positioner>, "side" | "align" | "alignOffset" | "collisionPadding">;

type MenubarContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  PositionProps & {
    className?: string;
    sideOffset?: number;
    alignOffset?: number;
  };
function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  collisionPadding = 12,
  ...rest
}: MenubarContentProps) {
  const [position, props] = splitPositioner(rest);
  return (
    <Primitive.Portal>
      <Primitive.Positioner align={align} alignOffset={alignOffset} sideOffset={sideOffset} collisionPadding={collisionPadding} className="z-50 outline-none" {...position}>
        <Primitive.Popup
          data-slot="menubar-content"
          className={cn(
            surface,
            "max-h-(--available-height) overflow-y-auto outline-none",
            className,
          )}
          {...props}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

type MenubarItemProps = Omit<React.ComponentProps<typeof Primitive.Item>, "className"> & {
  className?: string;
  /** Called when the item is chosen, with the pointer or the keyboard. */
  onSelect?: (event: Event) => void;
  /** Indent the item so it lines up with items that show a check or icon. */
  inset?: boolean;
  /** Style the item as a destructive action (delete, sign out). */
  destructive?: boolean;
};
function MenubarItem({
  className,
  inset,
  destructive,
  onSelect,
  onClick,
  ...props
}: MenubarItemProps) {
  return (
    <Primitive.Item
      data-slot="menubar-item"
      data-inset={inset ? "" : undefined}
      data-variant={destructive ? "destructive" : "default"}
      onClick={selectHandler(onSelect, onClick as never) as never}
      className={cn(
        itemBase,
        "data-[inset]:ps-8",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:[&_svg]:!text-destructive",
        className,
      )}
      {...props}
    />
  );
}

type MenubarCheckboxItemProps = Omit<React.ComponentProps<typeof Primitive.CheckboxItem>, "className" | "onClick"> & {
  className?: string;
  onSelect?: (event: Event) => void;
};
function MenubarCheckboxItem({
  className,
  children,
  onSelect,
  ...props
}: MenubarCheckboxItemProps) {
  return (
    <Primitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      onClick={selectHandler(onSelect) as never}
      className={cn(itemBase, "ps-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <Primitive.CheckboxItemIndicator>
          <Check aria-hidden="true" className="size-4 !text-foreground" />
        </Primitive.CheckboxItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  );
}

type MenubarRadioItemProps = Omit<React.ComponentProps<typeof Primitive.RadioItem>, "className" | "onClick"> & {
  className?: string;
  onSelect?: (event: Event) => void;
};
function MenubarRadioItem({
  className,
  children,
  onSelect,
  ...props
}: MenubarRadioItemProps) {
  return (
    <Primitive.RadioItem
      data-slot="menubar-radio-item"
      onClick={selectHandler(onSelect) as never}
      className={cn(itemBase, "ps-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <Primitive.RadioItemIndicator>
          <Circle
            aria-hidden="true"
            className="size-2 fill-current !text-foreground"
          />
        </Primitive.RadioItemIndicator>
      </span>
      {children}
    </Primitive.RadioItem>
  );
}

type MenubarLabelProps = React.ComponentProps<"div"> & {
  /** Indent the label to match inset items. */
  inset?: boolean;
};
/** A heading inside the menu. A plain element: Base UI's group label needs a group around it, and this one can sit anywhere. */
function MenubarLabel({
  className,
  inset,
  ...props
}: MenubarLabelProps) {
  return (
    <div
      data-slot="menubar-label"
      data-inset={inset ? "" : undefined}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-[inset]:ps-8",
        className,
      )}
      {...props}
    />
  );
}

type MenubarSeparatorProps = Omit<React.ComponentProps<typeof Primitive.Separator>, "className"> & { className?: string };
function MenubarSeparator({
  className,
  ...props
}: MenubarSeparatorProps) {
  return (
    <Primitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

type MenubarShortcutProps = React.ComponentProps<"span">;
/** Right-aligned keyboard hint. Decorative: the accessible name stays the item text, so add `aria-keyshortcuts` on the item when the shortcut is real. */
function MenubarShortcut({
  className,
  ...props
}: MenubarShortcutProps) {
  return (
    <span
      data-slot="menubar-shortcut"
      aria-hidden="true"
      className={cn(
        "ms-auto ps-4 font-mono text-xs tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type MenubarSubTriggerProps = Omit<React.ComponentProps<typeof Primitive.SubmenuTrigger>, "className"> & {
  className?: string;
  /** Indent the trigger to match inset items. */
  inset?: boolean;
};
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenubarSubTriggerProps) {
  return (
    <Primitive.SubmenuTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(
        itemBase,
        "data-[inset]:ps-8 data-popup-open:bg-accent data-popup-open:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight aria-hidden="true" className="ms-auto size-4 rtl:rotate-180" />
    </Primitive.SubmenuTrigger>
  );
}

type MenubarSubContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  PositionProps & {
    className?: string;
  };
function MenubarSubContent({
  className,
  collisionPadding = 12,
  ...rest
}: MenubarSubContentProps) {
  const [position, props] = splitPositioner(rest);
  return (
    <Primitive.Portal>
      <Primitive.Positioner collisionPadding={collisionPadding} className="z-50 outline-none" {...position}>
        <Primitive.Popup
          data-slot="menubar-sub-content"
          className={cn(surface, "outline-none", className)}
          {...props}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  type MenubarProps,
  type MenubarMenuProps,
  type MenubarTriggerProps,
  type MenubarContentProps,
  type MenubarGroupProps,
  type MenubarItemProps,
  type MenubarCheckboxItemProps,
  type MenubarRadioGroupProps,
  type MenubarRadioItemProps,
  type MenubarLabelProps,
  type MenubarSeparatorProps,
  type MenubarShortcutProps,
  type MenubarSubProps,
  type MenubarSubTriggerProps,
  type MenubarSubContentProps,
};
