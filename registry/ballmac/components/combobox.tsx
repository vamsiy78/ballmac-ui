// Ballmac UI: Combobox. https://ui.ballmac.com/components/combobox
"use client";

import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ballmac/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ballmac/popover";
import { cn } from "@/lib/utils";

type ComboboxOption = {
  /** Unique value returned in `onValueChange`. */
  value: string;
  /** Text shown in the list and in the trigger. */
  label: string;
  /** Muted second line in the list. */
  description?: string;
  /** Extra words the search should match. */
  keywords?: string[];
  /** Leading icon or avatar. */
  icon?: React.ReactNode;
  /** Prevent choosing this option. */
  disabled?: boolean;
  /** Optional group heading; options with the same group are listed together. */
  group?: string;
};

type ComboboxProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> & {
  /** Options to choose from. */
  options: ComboboxOption[];
  /** Controlled selected value ("" for none). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value, or "" when cleared. */
  onValueChange?: (value: string) => void;
  /** Text on the trigger when nothing is chosen. */
  placeholder?: string;
  /** Placeholder inside the search field. */
  searchPlaceholder?: string;
  /** Text shown when the search has no matches. */
  emptyText?: string;
  /** Show a control that clears the selection. */
  clearable?: boolean;
  /** Mark the field invalid (`aria-invalid`, destructive border). */
  invalid?: boolean;
  /** Name for a hidden input, so the value submits with a native form. */
  name?: string;
  /** Classes for the popup panel. */
  contentClassName?: string;
};

/** A searchable single-choice picker: a trigger button that opens a filterable list. */
function Combobox({
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search",
  emptyText = "No results found.",
  clearable = false,
  invalid = false,
  disabled,
  name,
  className,
  contentClassName,
  "aria-label": ariaLabel,
  ...props
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;
  const selected = options.find((o) => o.value === value);
  const choose = (next: string) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };
  const groups = React.useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    for (const o of options) {
      const key = o.group ?? "";
      map.set(key, [...(map.get(key) ?? []), o]);
    }
    return [...map.entries()];
  }, [options]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger
          data-slot="combobox"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,border-color,box-shadow] duration-150 hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30",
            clearable && selected && "pr-14",
            !selected && "text-muted-foreground",
            className,
          )}
          {...props}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.icon}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
          <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        {clearable && selected && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => choose("")}
            className="absolute top-1/2 right-8 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        )}
        {name && <input type="hidden" name={name} value={value} />}
      </div>
      <PopoverContent
        label={ariaLabel ?? placeholder}
        align="start"
        sideOffset={4}
        className={cn(
          "w-(--radix-popover-trigger-width) min-w-56 gap-0 p-0",
          contentClassName,
        )}
      >
        <Command label={ariaLabel ?? placeholder}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map(([heading, list]) => (
              <CommandGroup key={heading || "options"} heading={heading || undefined}>
                {list.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    keywords={[o.label, ...(o.keywords ?? [])]}
                    description={o.description}
                    selected={o.value === value}
                    disabled={o.disabled}
                    onSelect={() => {
                      choose(o.value === value && clearable ? "" : o.value);
                      setOpen(false);
                    }}
                  >
                    {o.icon}
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox, type ComboboxProps, type ComboboxOption };
