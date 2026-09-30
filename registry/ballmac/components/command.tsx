// Ballmac UI: Command. https://ui.ballmac.com/components/command
// Based on shadcn/ui Command (MIT, Copyright (c) 2023 shadcn) on cmdk (MIT, Copyright (c) 2022 Dip), adding a page-safe scroll fix, an item description, a loading row, and a hotkey dialog.
"use client";

import * as React from "react";
import { Command as Primitive } from "cmdk";
import { Check, Search } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * cmdk scrolls the highlighted row into view with scrollIntoView, which also scrolls the page when
 * the command menu is off-screen (an inline demo below the fold). Route it to the list only.
 */
function scrollWithinList(this: HTMLElement) {
  const list = this.closest<HTMLElement>("[cmdk-list]");
  if (!list) return;
  const bounds = list.getBoundingClientRect();
  const rect = this.getBoundingClientRect();
  if (rect.top < bounds.top) list.scrollTop -= bounds.top - rect.top + 8;
  else if (rect.bottom > bounds.bottom)
    list.scrollTop += rect.bottom - bounds.bottom + 8;
}
function keepScrollInList(el: HTMLElement | null) {
  if (el) el.scrollIntoView = scrollWithinList;
}
function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

type CommandProps = React.ComponentProps<typeof Primitive>;
/** Root. Accepts cmdk props such as `filter`, `shouldFilter`, `value`, `onValueChange` and `loop`. */
function Command({ className, loop = true, label = "Command menu", ...props }: CommandProps) {
  return (
    <Primitive
      data-slot="command"
      loop={loop}
      label={label}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
}

type CommandDialogProps = Omit<CommandProps, "title"> & {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Key that toggles the dialog together with ⌘ (Ctrl on Windows and Linux). `false` turns the shortcut off. */
  hotkey?: string | false;
  /** Accessible title of the dialog (visually hidden). */
  title?: string;
  /** Accessible description of the dialog (visually hidden). */
  description?: string;
};
/** The command menu in a modal dialog near the top of the screen. Toggled with ⌘K by default; Escape closes it. */
function CommandDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hotkey = "k",
  title = "Command menu",
  description = "Type a command or search. Use the arrow keys to move and Enter to run.",
  className,
  children,
  ...props
}: CommandDialogProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  React.useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === hotkey.toLowerCase()
      ) {
        event.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hotkey, open, setOpen]);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="command-overlay"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
        />
        <DialogPrimitive.Content
          data-slot="command-dialog"
          className="fixed top-[14dvh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border bg-popover shadow-[0_24px_60px_-12px_rgb(0_0_0/0.4)] outline-none duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>
          <Command className={className} {...props}>
            {children}
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

type CommandInputProps = React.ComponentProps<typeof Primitive.Input>;
function CommandInput({ className, ...props }: CommandInputProps) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-12 shrink-0 items-center gap-2 border-b px-3.5"
    >
      <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <Primitive.Input
        data-slot="command-input"
        className={cn(
          "h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

type CommandListProps = React.ComponentProps<typeof Primitive.List>;
function CommandList({ className, ...props }: CommandListProps) {
  return (
    <Primitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[min(20rem,55dvh)] scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain p-1",
        className,
      )}
      {...props}
    />
  );
}

type CommandEmptyProps = React.ComponentProps<typeof Primitive.Empty>;
function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  return (
    <Primitive.Empty
      data-slot="command-empty"
      className={cn("py-8 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

type CommandLoadingProps = React.ComponentProps<typeof Primitive.Loading>;
/** Shown while results load. Renders `role="progressbar"` with the given `progress` (0 to 100). */
function CommandLoading({ className, ...props }: CommandLoadingProps) {
  return (
    <Primitive.Loading
      data-slot="command-loading"
      className={cn("py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

type CommandGroupProps = React.ComponentProps<typeof Primitive.Group>;
function CommandGroup({ ref, className, ...props }: CommandGroupProps) {
  return (
    <Primitive.Group
      ref={(el: HTMLDivElement | null) => {
        keepScrollInList(el?.querySelector<HTMLElement>("[cmdk-group-heading]") ?? null);
        setRef(ref, el);
      }}
      data-slot="command-group"
      className={cn(
        "overflow-hidden text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type CommandSeparatorProps = React.ComponentProps<typeof Primitive.Separator>;
function CommandSeparator({ className, ...props }: CommandSeparatorProps) {
  return (
    <Primitive.Separator
      data-slot="command-separator"
      aria-hidden="true"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

type CommandItemProps = React.ComponentProps<typeof Primitive.Item> & {
  /** Second line of muted text under the title. */
  description?: React.ReactNode;
  /** Show a check at the end, for the currently chosen option in a picker. */
  selected?: boolean;
};
function CommandItem({
  ref,
  className,
  description,
  selected,
  children,
  ...props
}: CommandItemProps) {
  return (
    <Primitive.Item
      ref={(el: HTMLDivElement | null) => {
        keepScrollInList(el);
        setRef(ref, el);
      }}
      data-slot="command-item"
      data-checked={selected ? "true" : undefined}
      className={cn(
        "relative flex min-h-9 cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {description ? (
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="truncate">{children}</span>
          <span className="truncate text-xs text-muted-foreground">{description}</span>
        </span>
      ) : (
        children
      )}
      {selected && <Check aria-hidden="true" className="ml-auto size-4 !text-foreground" />}
    </Primitive.Item>
  );
}

type CommandShortcutProps = React.ComponentProps<"span">;
function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <span
      data-slot="command-shortcut"
      aria-hidden="true"
      className={cn(
        "ml-auto font-mono text-xs tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  type CommandProps,
  type CommandDialogProps,
  type CommandInputProps,
  type CommandListProps,
  type CommandEmptyProps,
  type CommandLoadingProps,
  type CommandGroupProps,
  type CommandItemProps,
  type CommandShortcutProps,
  type CommandSeparatorProps,
};
