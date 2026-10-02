// Ballmac UI: Context Menu. https://ui.ballmac.com/components/context-menu
// Based on shadcn/ui Context Menu (MIT, Copyright (c) 2023 shadcn), restyled with tokens, destructive and inset items, and a shortcut slot.
"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { ContextMenu as Primitive } from "radix-ui";
import { useDirection } from "@/lib/ballmac/direction";
import { cn } from "@/lib/utils";

const itemBase =
  "relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

const surface =
  "z-50 min-w-[12rem] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 motion-reduce:animate-none";

type ContextMenuProps = React.ComponentProps<typeof Primitive.Root>;
function ContextMenu(props: ContextMenuProps) {
  const dir = useDirection(props.dir);
  return <Primitive.Root data-slot="context-menu" dir={dir} {...props} />;
}

type ContextMenuTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return <Primitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

type ContextMenuGroupProps = React.ComponentProps<typeof Primitive.Group>;
function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <Primitive.Group data-slot="context-menu-group" {...props} />;
}

type ContextMenuSubProps = React.ComponentProps<typeof Primitive.Sub>;
function ContextMenuSub(props: ContextMenuSubProps) {
  return <Primitive.Sub data-slot="context-menu-sub" {...props} />;
}

type ContextMenuRadioGroupProps = React.ComponentProps<
  typeof Primitive.RadioGroup
>;
function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return (
    <Primitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
  );
}

type ContextMenuContentProps = React.ComponentProps<typeof Primitive.Content>;
function ContextMenuContent({
  className,
  collisionPadding = 12,
  ...props
}: ContextMenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="context-menu-content"
        collisionPadding={collisionPadding}
        className={cn(
          surface,
          "max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) overflow-y-auto",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

type ContextMenuItemProps = React.ComponentProps<typeof Primitive.Item> & {
  /** Indent the item so it lines up with items that show a check or icon. */
  inset?: boolean;
  /** Style the item as a destructive action (delete, sign out). */
  destructive?: boolean;
};
function ContextMenuItem({
  className,
  inset,
  destructive,
  ...props
}: ContextMenuItemProps) {
  return (
    <Primitive.Item
      data-slot="context-menu-item"
      data-inset={inset ? "" : undefined}
      data-variant={destructive ? "destructive" : "default"}
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

type ContextMenuCheckboxItemProps = React.ComponentProps<
  typeof Primitive.CheckboxItem
>;
function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <Primitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(itemBase, "ps-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <Primitive.ItemIndicator>
          <Check aria-hidden="true" className="size-4 !text-foreground" />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  );
}

type ContextMenuRadioItemProps = React.ComponentProps<
  typeof Primitive.RadioItem
>;
function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <Primitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(itemBase, "ps-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
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

type ContextMenuLabelProps = React.ComponentProps<typeof Primitive.Label> & {
  /** Indent the label to match inset items. */
  inset?: boolean;
};
function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  return (
    <Primitive.Label
      data-slot="context-menu-label"
      data-inset={inset ? "" : undefined}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-[inset]:ps-8",
        className,
      )}
      {...props}
    />
  );
}

type ContextMenuSeparatorProps = React.ComponentProps<
  typeof Primitive.Separator
>;
function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <Primitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

type ContextMenuShortcutProps = React.ComponentProps<"span">;
/** Right-aligned keyboard hint. Decorative: the accessible name stays the item text, so add `aria-keyshortcuts` on the item when the shortcut is real. */
function ContextMenuShortcut({
  className,
  ...props
}: ContextMenuShortcutProps) {
  return (
    <span
      data-slot="context-menu-shortcut"
      aria-hidden="true"
      className={cn(
        "ms-auto ps-4 font-mono text-xs tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type ContextMenuSubTriggerProps = React.ComponentProps<
  typeof Primitive.SubTrigger
> & {
  /** Indent the trigger to match inset items. */
  inset?: boolean;
};
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <Primitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(
        itemBase,
        "data-[inset]:ps-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight aria-hidden="true" className="ms-auto size-4 rtl:rotate-180" />
    </Primitive.SubTrigger>
  );
}

type ContextMenuSubContentProps = React.ComponentProps<
  typeof Primitive.SubContent
>;
function ContextMenuSubContent({
  className,
  collisionPadding = 12,
  ...props
}: ContextMenuSubContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.SubContent
        data-slot="context-menu-sub-content"
        collisionPadding={collisionPadding}
        className={cn(
          surface,
          "origin-(--radix-context-menu-content-transform-origin)",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  type ContextMenuProps,
  type ContextMenuTriggerProps,
  type ContextMenuContentProps,
  type ContextMenuGroupProps,
  type ContextMenuItemProps,
  type ContextMenuCheckboxItemProps,
  type ContextMenuRadioGroupProps,
  type ContextMenuRadioItemProps,
  type ContextMenuLabelProps,
  type ContextMenuSeparatorProps,
  type ContextMenuShortcutProps,
  type ContextMenuSubProps,
  type ContextMenuSubTriggerProps,
  type ContextMenuSubContentProps,
};
