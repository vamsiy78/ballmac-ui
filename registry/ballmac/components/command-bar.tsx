// Ballmac UI: Command Bar. https://ui.ballmac.com/components/command-bar
"use client";

import * as React from "react";
import { ChevronRight, CornerDownLeft, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ballmac/command";
import { Kbd } from "@/components/ballmac/kbd";
import { cn } from "@/lib/utils";

type CommandBarItem = {
  /** Unique id. */
  id: string;
  /** Visible name. */
  label: string;
  /** Muted second line. */
  description?: string;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Keys shown at the end, for example `["⌘", "N"]`. Display only. */
  shortcut?: string[];
  /** Extra words the search should match. */
  keywords?: string[];
  /** Runs when chosen. The bar closes afterwards unless `keepOpen` is set. */
  onSelect?: () => void;
  /** Keep the bar open after running `onSelect`. */
  keepOpen?: boolean;
  /** Choosing this item opens a second page with these groups (for example "Change theme…"). */
  pages?: CommandBarGroup[];
};

type CommandBarGroup = {
  /** Group heading. */
  heading: string;
  items: CommandBarItem[];
};

type CommandBarProps = {
  /** Top-level groups. */
  groups: CommandBarGroup[];
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the bar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder of the search field on the first page. */
  placeholder?: string;
  /** Text shown when nothing matches. */
  emptyText?: string;
  /** Key that toggles the bar together with ⌘ (Ctrl on Windows and Linux). `false` turns the shortcut off. */
  hotkey?: string | false;
  /** Text on the trigger button. `false` hides the trigger so you can open the bar yourself. */
  trigger?: string | false;
  /** Classes for the trigger button. */
  triggerClassName?: string;
  /** Accessible name of the dialog. */
  title?: string;
};

/**
 * A command palette with pages. Type to search; choose an item that has `pages` to drill in (Backspace on an empty
 * field goes back); every other item runs and closes. The trigger is a search-field-style button with the hotkey.
 */
function CommandBar({
  groups,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Search commands…",
  emptyText = "No results found.",
  hotkey = "k",
  trigger = "Search or jump to…",
  triggerClassName,
  title = "Command bar",
}: CommandBarProps) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const [stack, setStack] = React.useState<CommandBarItem[]>([]);
  const [search, setSearch] = React.useState("");
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
      if (!next) {
        setStack([]);
        setSearch("");
      }
    },
    [openProp, onOpenChange],
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const current = stack.at(-1);
  const visibleGroups = current?.pages ?? groups;

  function choose(item: CommandBarItem) {
    if (item.pages) {
      setStack((s) => [...s, item]);
      setSearch("");
      // Choosing with the pointer moves focus off the field; bring it back so typing and Backspace keep working.
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    item.onSelect?.();
    if (!item.keepOpen) setOpen(false);
  }

  return (
    <>
      {trigger !== false && (
        <button
          type="button"
          data-slot="command-bar-trigger"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-keyshortcuts={hotkey ? `Meta+${hotkey.toUpperCase()} Control+${hotkey.toUpperCase()}` : undefined}
          className={cn(
            "inline-flex h-10 w-full max-w-sm items-center gap-2.5 rounded-xl border bg-background px-3 text-left text-sm text-muted-foreground shadow-xs outline-none transition-[border-color,box-shadow,background-color] hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            triggerClassName,
          )}
        >
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span className="flex-1 truncate">{trigger}</span>
          {hotkey && (
            <span aria-hidden="true" className="flex items-center gap-1">
              <Kbd size="sm">⌘</Kbd>
              <Kbd size="sm">{hotkey.toUpperCase()}</Kbd>
            </span>
          )}
        </button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        hotkey={hotkey}
        title={title}
        label={title}
        className="[&_[cmdk-list]]:max-h-[min(22rem,50dvh)]"
      >
        {stack.length > 0 && (
          <div className="flex items-center gap-1 border-b px-3 pt-2.5 pb-2 text-xs" aria-label="Current page">
            <button
              type="button"
              onClick={() => {
                setStack([]);
                setSearch("");
              }}
              className="rounded px-1.5 py-0.5 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              All
            </button>
            {stack.map((page, index) => (
              <React.Fragment key={page.id}>
                <ChevronRight aria-hidden="true" className="size-3 text-muted-foreground" />
                <span aria-current={index === stack.length - 1 ? "page" : undefined} className="rounded bg-accent px-1.5 py-0.5 font-medium">
                  {page.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        <CommandInput
          ref={inputRef}
          value={search}
          onValueChange={setSearch}
          placeholder={current ? `Search ${current.label.toLowerCase()}…` : placeholder}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !search && stack.length) {
              event.preventDefault();
              setStack((s) => s.slice(0, -1));
            }
          }}
        />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          {visibleGroups.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  keywords={[item.label, ...(item.keywords ?? [])]}
                  icon={item.icon}
                  description={item.description}
                  onSelect={() => choose(item)}
                >
                  {item.label}
                  {item.pages ? (
                    <ChevronRight aria-hidden="true" className="ml-auto size-4" />
                  ) : (
                    item.shortcut && <CommandShortcut>{item.shortcut.join(" ")}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div
          aria-hidden="true"
          className="flex items-center gap-4 border-t bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Kbd size="sm">↑</Kbd>
            <Kbd size="sm">↓</Kbd> Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd size="sm">
              <CornerDownLeft className="size-3" />
            </Kbd>{" "}
            Select
          </span>
          {stack.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Kbd size="sm">⌫</Kbd> Back
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd size="sm">Esc</Kbd> Close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}

export { CommandBar, type CommandBarProps, type CommandBarGroup, type CommandBarItem };
