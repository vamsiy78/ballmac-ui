// Ballmac UI: Context Menu. https://ui.ballmac.com/components/context-menu
// Based on shadcn/ui Context Menu (MIT, Copyright (c) 2023 shadcn), restyled with tokens, destructive and inset items, and a shortcut slot.
"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { ContextMenu as Primitive } from "@base-ui/react/context-menu";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { selectHandler, splitPositioner } from "@/lib/ballmac/positioner";
import { cn } from "@/lib/utils";

const itemBase =
  "relative flex min-h-[var(--bm-menu-item-h,2rem)] cursor-default select-none items-center gap-2 rounded-[var(--bm-menu-item-radius,var(--radius-md))] px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

const surface =
  "min-w-[12rem] origin-(--transform-origin) overflow-hidden rounded-xl border bg-popover/[var(--bm-material-alpha,100%)] backdrop-blur-[var(--bm-material-blur,0px)] p-[var(--bm-menu-pad,0.25rem)] text-popover-foreground shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))] transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none";

type ContextMenuProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl";
};
function ContextMenu({ dir: dirProp, ...props }: ContextMenuProps) {
  const dir = useDirection(dirProp);
  return (
    <DirectionProvider dir={dir}>
      <Primitive.Root {...props} />
    </DirectionProvider>
  );
}

type ContextMenuTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & { className?: string };
function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return <Primitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

type ContextMenuGroupProps = React.ComponentProps<typeof Primitive.Group>;
function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <Primitive.Group data-slot="context-menu-group" {...props} />;
}

type ContextMenuSubProps = React.ComponentProps<typeof Primitive.SubmenuRoot>;
function ContextMenuSub(props: ContextMenuSubProps) {
  return <Primitive.SubmenuRoot {...props} />;
}

type ContextMenuRadioGroupProps = Omit<React.ComponentProps<typeof Primitive.RadioGroup>, "onValueChange"> & {
  onValueChange?: (value: string) => void;
};
function ContextMenuRadioGroup({ onValueChange, ...props }: ContextMenuRadioGroupProps) {
  return (
    <Primitive.RadioGroup data-slot="context-menu-radio-group" onValueChange={(v) => onValueChange?.(String(v))} {...props} />
  );
}

type PositionProps = Pick<React.ComponentProps<typeof Primitive.Positioner>, "side" | "align" | "alignOffset" | "collisionPadding">;

type ContextMenuContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  PositionProps & {
    className?: string;
  };
function ContextMenuContent({
  className,
  collisionPadding = 12,
  ...rest
}: ContextMenuContentProps) {
  const [position, props] = splitPositioner(rest);
  return (
    <Primitive.Portal>
      <Primitive.Positioner collisionPadding={collisionPadding} className="z-50 outline-none" {...position}>
        <Primitive.Popup
          data-slot="context-menu-content"
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

type ContextMenuItemProps = Omit<React.ComponentProps<typeof Primitive.Item>, "className"> & {
  className?: string;
  /** Called when the item is chosen, with the pointer or the keyboard. */
  onSelect?: (event: Event) => void;
  /** Indent the item so it lines up with items that show a check or icon. */
  inset?: boolean;
  /** Style the item as a destructive action (delete, sign out). */
  destructive?: boolean;
};
function ContextMenuItem({
  className,
  inset,
  destructive,
  onSelect,
  onClick,
  ...props
}: ContextMenuItemProps) {
  return (
    <Primitive.Item
      data-slot="context-menu-item"
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

type ContextMenuCheckboxItemProps = Omit<React.ComponentProps<typeof Primitive.CheckboxItem>, "className" | "onClick"> & {
  className?: string;
  onSelect?: (event: Event) => void;
};
function ContextMenuCheckboxItem({
  className,
  children,
  onSelect,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <Primitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
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

type ContextMenuRadioItemProps = Omit<React.ComponentProps<typeof Primitive.RadioItem>, "className" | "onClick"> & {
  className?: string;
  onSelect?: (event: Event) => void;
};
function ContextMenuRadioItem({
  className,
  children,
  onSelect,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <Primitive.RadioItem
      data-slot="context-menu-radio-item"
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

type ContextMenuLabelProps = React.ComponentProps<"div"> & {
  /** Indent the label to match inset items. */
  inset?: boolean;
};
/** A heading inside the menu. A plain element: Base UI's group label needs a group around it, and this one can sit anywhere. */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  return (
    <div
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

type ContextMenuSeparatorProps = Omit<React.ComponentProps<typeof Primitive.Separator>, "className"> & { className?: string };
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

type ContextMenuSubTriggerProps = Omit<React.ComponentProps<typeof Primitive.SubmenuTrigger>, "className"> & {
  className?: string;
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
    <Primitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
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

type ContextMenuSubContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  PositionProps & {
    className?: string;
  };
function ContextMenuSubContent({
  className,
  collisionPadding = 12,
  ...rest
}: ContextMenuSubContentProps) {
  const [position, props] = splitPositioner(rest);
  return (
    <Primitive.Portal>
      <Primitive.Positioner collisionPadding={collisionPadding} className="z-50 outline-none" {...position}>
        <Primitive.Popup
          data-slot="context-menu-sub-content"
          className={cn(surface, "outline-none", className)}
          {...props}
        />
      </Primitive.Positioner>
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
