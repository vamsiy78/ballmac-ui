// Ballmac UI: Dropdown Menu. https://ui.ballmac.com/components/dropdown-menu
// Based on shadcn/ui Dropdown Menu (MIT, Copyright (c) 2023 shadcn), restyled with tokens, destructive and inset items, shortcut and description slots.
"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { Menu as Primitive } from "@base-ui/react/menu";
import { DirectionProvider, useDirection } from "@/lib/ballmac/direction";
import { selectHandler, splitPositioner } from "@/lib/ballmac/positioner";
import { cn } from "@/lib/utils";

const itemBase =
  "relative flex min-h-[var(--bm-menu-item-h,2rem)] cursor-default select-none items-center gap-2 rounded-[var(--bm-menu-item-radius,var(--radius-md))] px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

const surface =
  "min-w-[12rem] origin-(--transform-origin) overflow-hidden rounded-xl border bg-popover/[var(--bm-material-alpha,100%)] backdrop-blur-[var(--bm-material-blur,0px)] p-[var(--bm-menu-pad,0.25rem)] text-popover-foreground shadow-[var(--bm-shadow-popover,0_12px_36px_-10px_rgb(0_0_0/0.25))] transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none";

type DropdownMenuProps = React.ComponentProps<typeof Primitive.Root> & {
  /** Reading direction for the arrow keys. Defaults to the page's. */
  dir?: "ltr" | "rtl";
};
function DropdownMenu({ dir: dirProp, ...props }: DropdownMenuProps) {
  const dir = useDirection(dirProp);
  return (
    <DirectionProvider dir={dir}>
      <Primitive.Root {...props} />
    </DirectionProvider>
  );
}

type DropdownMenuTriggerProps = Omit<React.ComponentProps<typeof Primitive.Trigger>, "className"> & { className?: string };
function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <Primitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

type DropdownMenuGroupProps = React.ComponentProps<typeof Primitive.Group>;
function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <Primitive.Group data-slot="dropdown-menu-group" {...props} />;
}

type DropdownMenuSubProps = React.ComponentProps<typeof Primitive.SubmenuRoot>;
function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <Primitive.SubmenuRoot {...props} />;
}

type DropdownMenuRadioGroupProps = Omit<React.ComponentProps<typeof Primitive.RadioGroup>, "onValueChange"> & {
  onValueChange?: (value: string) => void;
};
function DropdownMenuRadioGroup({ onValueChange, ...props }: DropdownMenuRadioGroupProps) {
  return (
    <Primitive.RadioGroup data-slot="dropdown-menu-radio-group" onValueChange={(v) => onValueChange?.(String(v))} {...props} />
  );
}

type PositionProps = Pick<React.ComponentProps<typeof Primitive.Positioner>, "side" | "align" | "alignOffset" | "collisionPadding">;

type DropdownMenuContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  PositionProps & {
    className?: string;
    sideOffset?: number;
  };
function DropdownMenuContent({
  className,
  sideOffset = 6,
  collisionPadding = 12,
  ...rest
}: DropdownMenuContentProps) {
  const [position, props] = splitPositioner(rest);
  return (
    <Primitive.Portal>
      <Primitive.Positioner sideOffset={sideOffset} collisionPadding={collisionPadding} className="z-50 outline-none" {...position}>
        <Primitive.Popup
          data-slot="dropdown-menu-content"
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

type DropdownMenuItemProps = Omit<React.ComponentProps<typeof Primitive.Item>, "className"> & {
  className?: string;
  /** Called when the item is chosen, with the pointer or the keyboard. */
  onSelect?: (event: Event) => void;
  /** Indent the item so it lines up with items that show a check or icon. */
  inset?: boolean;
  /** Style the item as a destructive action (delete, sign out). */
  destructive?: boolean;
};
function DropdownMenuItem({
  className,
  inset,
  destructive,
  onSelect,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  return (
    <Primitive.Item
      data-slot="dropdown-menu-item"
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

type DropdownMenuCheckboxItemProps = Omit<React.ComponentProps<typeof Primitive.CheckboxItem>, "className" | "onClick"> & {
  className?: string;
  onSelect?: (event: Event) => void;
};
function DropdownMenuCheckboxItem({
  className,
  children,
  onSelect,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <Primitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
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

type DropdownMenuRadioItemProps = Omit<React.ComponentProps<typeof Primitive.RadioItem>, "className" | "onClick"> & {
  className?: string;
  onSelect?: (event: Event) => void;
};
function DropdownMenuRadioItem({
  className,
  children,
  onSelect,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <Primitive.RadioItem
      data-slot="dropdown-menu-radio-item"
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

type DropdownMenuLabelProps = React.ComponentProps<"div"> & {
  /** Indent the label to match inset items. */
  inset?: boolean;
};
/** A heading inside the menu. A plain element: Base UI's group label needs a group around it, and this one can sit anywhere. */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset ? "" : undefined}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-[inset]:ps-8",
        className,
      )}
      {...props}
    />
  );
}

type DropdownMenuSeparatorProps = Omit<React.ComponentProps<typeof Primitive.Separator>, "className"> & { className?: string };
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
        "ms-auto ps-4 font-mono text-xs tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type DropdownMenuSubTriggerProps = Omit<React.ComponentProps<typeof Primitive.SubmenuTrigger>, "className"> & {
  className?: string;
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
    <Primitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
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

type DropdownMenuSubContentProps = Omit<React.ComponentProps<typeof Primitive.Popup>, "className"> &
  PositionProps & {
    className?: string;
  };
function DropdownMenuSubContent({
  className,
  collisionPadding = 12,
  ...rest
}: DropdownMenuSubContentProps) {
  const [position, props] = splitPositioner(rest);
  return (
    <Primitive.Portal>
      <Primitive.Positioner collisionPadding={collisionPadding} className="z-50 outline-none" {...position}>
        <Primitive.Popup
          data-slot="dropdown-menu-sub-content"
          className={cn(surface, "outline-none", className)}
          {...props}
        />
      </Primitive.Positioner>
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
