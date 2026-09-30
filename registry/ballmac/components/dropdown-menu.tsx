// Ballmac UI: Dropdown Menu. https://ui.ballmac.com/components/dropdown-menu
// Based on shadcn/ui Dropdown Menu (MIT, Copyright (c) 2023 shadcn), restyled with tokens, destructive and inset items, shortcut and description slots.
"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { DropdownMenu as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

const itemBase =
  "relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

const surface =
  "z-50 min-w-[12rem] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 motion-reduce:animate-none";

type DropdownMenuProps = React.ComponentProps<typeof Primitive.Root>;
function DropdownMenu(props: DropdownMenuProps) {
  return <Primitive.Root data-slot="dropdown-menu" {...props} />;
}

type DropdownMenuTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <Primitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

type DropdownMenuGroupProps = React.ComponentProps<typeof Primitive.Group>;
function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <Primitive.Group data-slot="dropdown-menu-group" {...props} />;
}

type DropdownMenuSubProps = React.ComponentProps<typeof Primitive.Sub>;
function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <Primitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

type DropdownMenuRadioGroupProps = React.ComponentProps<
  typeof Primitive.RadioGroup
>;
function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return (
    <Primitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
  );
}

type DropdownMenuContentProps = React.ComponentProps<typeof Primitive.Content>;
function DropdownMenuContent({
  className,
  sideOffset = 6,
  collisionPadding = 12,
  ...props
}: DropdownMenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          surface,
          "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin) overflow-y-auto",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

type DropdownMenuItemProps = React.ComponentProps<typeof Primitive.Item> & {
  /** Indent the item so it lines up with items that show a check or icon. */
  inset?: boolean;
  /** Style the item as a destructive action (delete, sign out). */
  destructive?: boolean;
};
function DropdownMenuItem({
  className,
  inset,
  destructive,
  ...props
}: DropdownMenuItemProps) {
  return (
    <Primitive.Item
      data-slot="dropdown-menu-item"
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

type DropdownMenuCheckboxItemProps = React.ComponentProps<
  typeof Primitive.CheckboxItem
>;
function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <Primitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
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

type DropdownMenuRadioItemProps = React.ComponentProps<
  typeof Primitive.RadioItem
>;
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <Primitive.RadioItem
      data-slot="dropdown-menu-radio-item"
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

type DropdownMenuLabelProps = React.ComponentProps<typeof Primitive.Label> & {
  /** Indent the label to match inset items. */
  inset?: boolean;
};
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <Primitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset ? "" : undefined}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

type DropdownMenuSeparatorProps = React.ComponentProps<
  typeof Primitive.Separator
>;
function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <Primitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

type DropdownMenuShortcutProps = React.ComponentProps<"span">;
/** Right-aligned keyboard hint. Decorative: the accessible name stays the item text, so add `aria-keyshortcuts` on the item when the shortcut is real. */
function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      aria-hidden="true"
      className={cn(
        "ml-auto pl-4 font-mono text-xs tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type DropdownMenuSubTriggerProps = React.ComponentProps<
  typeof Primitive.SubTrigger
> & {
  /** Indent the trigger to match inset items. */
  inset?: boolean;
};
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <Primitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
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

type DropdownMenuSubContentProps = React.ComponentProps<
  typeof Primitive.SubContent
>;
function DropdownMenuSubContent({
  className,
  collisionPadding = 12,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.SubContent
        data-slot="dropdown-menu-sub-content"
        collisionPadding={collisionPadding}
        className={cn(
          surface,
          "origin-(--radix-dropdown-menu-content-transform-origin)",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  type DropdownMenuProps,
  type DropdownMenuTriggerProps,
  type DropdownMenuContentProps,
  type DropdownMenuGroupProps,
  type DropdownMenuItemProps,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuShortcutProps,
  type DropdownMenuSubProps,
  type DropdownMenuSubTriggerProps,
  type DropdownMenuSubContentProps,
};
