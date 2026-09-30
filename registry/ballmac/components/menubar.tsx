// Ballmac UI: Menubar. https://ui.ballmac.com/components/menubar
// Based on shadcn/ui Menubar (MIT, Copyright (c) 2023 shadcn), restyled with tokens, destructive and inset items, and a shortcut slot.
"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { Menubar as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

const itemBase =
  "relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

const surface =
  "z-50 min-w-[12rem] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 motion-reduce:animate-none";

type MenubarProps = React.ComponentProps<typeof Primitive.Root>;
/** The horizontal bar. Arrow keys move between menus; Enter or ArrowDown opens one. */
function Menubar({ className, ...props }: MenubarProps) {
  return (
    <Primitive.Root
      data-slot="menubar"
      className={cn(
        "flex h-9 w-fit items-center gap-1 rounded-lg border bg-background p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

type MenubarMenuProps = React.ComponentProps<typeof Primitive.Menu>;
function MenubarMenu(props: MenubarMenuProps) {
  return <Primitive.Menu data-slot="menubar-menu" {...props} />;
}

type MenubarGroupProps = React.ComponentProps<typeof Primitive.Group>;
function MenubarGroup(props: MenubarGroupProps) {
  return <Primitive.Group data-slot="menubar-group" {...props} />;
}

type MenubarSubProps = React.ComponentProps<typeof Primitive.Sub>;
function MenubarSub(props: MenubarSubProps) {
  return <Primitive.Sub data-slot="menubar-sub" {...props} />;
}

type MenubarRadioGroupProps = React.ComponentProps<typeof Primitive.RadioGroup>;
function MenubarRadioGroup(props: MenubarRadioGroupProps) {
  return <Primitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

type MenubarTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex h-7 select-none items-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

type MenubarContentProps = React.ComponentProps<typeof Primitive.Content>;
function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  collisionPadding = 12,
  ...props
}: MenubarContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          surface,
          "max-h-(--radix-menubar-content-available-height) origin-(--radix-menubar-content-transform-origin) overflow-y-auto",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

type MenubarItemProps = React.ComponentProps<typeof Primitive.Item> & {
  /** Indent the item so it lines up with items that show a check or icon. */
  inset?: boolean;
  /** Style the item as a destructive action (delete, sign out). */
  destructive?: boolean;
};
function MenubarItem({
  className,
  inset,
  destructive,
  ...props
}: MenubarItemProps) {
  return (
    <Primitive.Item
      data-slot="menubar-item"
      data-inset={inset ? "" : undefined}
      data-variant={destructive ? "destructive" : "default"}
      className={cn(
        itemBase,
        "data-[inset]:pl-8",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:[&_svg]:!text-destructive",
        className,
      )}
      {...props}
    />
  );
}

type MenubarCheckboxItemProps = React.ComponentProps<
  typeof Primitive.CheckboxItem
>;
function MenubarCheckboxItem({
  className,
  children,
  ...props
}: MenubarCheckboxItemProps) {
  return (
    <Primitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(itemBase, "pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center">
        <Primitive.ItemIndicator>
          <Check aria-hidden="true" className="size-4 !text-foreground" />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  );
}

type MenubarRadioItemProps = React.ComponentProps<
  typeof Primitive.RadioItem
>;
function MenubarRadioItem({
  className,
  children,
  ...props
}: MenubarRadioItemProps) {
  return (
    <Primitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(itemBase, "pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center">
        <Primitive.ItemIndicator>
          <Circle
            aria-hidden="true"
            className="size-2 fill-current !text-foreground"
          />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.RadioItem>
  );
}

type MenubarLabelProps = React.ComponentProps<typeof Primitive.Label> & {
  /** Indent the label to match inset items. */
  inset?: boolean;
};
function MenubarLabel({
  className,
  inset,
  ...props
}: MenubarLabelProps) {
  return (
    <Primitive.Label
      data-slot="menubar-label"
      data-inset={inset ? "" : undefined}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

type MenubarSeparatorProps = React.ComponentProps<
  typeof Primitive.Separator
>;
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
        "ml-auto pl-4 font-mono text-xs tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type MenubarSubTriggerProps = React.ComponentProps<
  typeof Primitive.SubTrigger
> & {
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
    <Primitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(
        itemBase,
        "data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight aria-hidden="true" className="ml-auto size-4" />
    </Primitive.SubTrigger>
  );
}

type MenubarSubContentProps = React.ComponentProps<
  typeof Primitive.SubContent
>;
function MenubarSubContent({
  className,
  collisionPadding = 12,
  ...props
}: MenubarSubContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.SubContent
        data-slot="menubar-sub-content"
        collisionPadding={collisionPadding}
        className={cn(
          surface,
          "origin-(--radix-menubar-content-transform-origin)",
          className,
        )}
        {...props}
      />
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
