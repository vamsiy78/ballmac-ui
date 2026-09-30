// Ballmac UI: Input Group. https://ui.ballmac.com/components/input-group
// Based on shadcn/ui Input Group (MIT, Copyright (c) 2023 shadcn), adding a size scale, invalid state, and click-to-focus addons.
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type InputGroupProps = React.ComponentProps<"div"> & {
  /** Accessible name for the group, for example "Website address". */
  "aria-label"?: string;
};
/**
 * A bordered field that holds one input or textarea plus addons: icons, text, buttons, keyboard hints.
 * The group draws the border, focus ring and invalid state; the control inside is borderless.
 */
function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-background shadow-xs transition-[color,border-color,box-shadow] duration-150 dark:bg-input/30",
        "has-[>textarea]:h-auto",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col",
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
        "has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]]:ring-destructive/20",
        "has-[[data-slot=input-group-control]:disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

const addonVariants = cva(
  "flex cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-sm",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:-ml-1.5",
        "inline-end": "order-last pr-3 has-[>button]:-mr-1.5",
        "block-start": "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
        "block-end": "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: { align: "inline-start" },
  },
);

type InputGroupAddonProps = React.ComponentProps<"div"> &
  VariantProps<typeof addonVariants> & {
    /** Where the addon sits. Inline addons flank the control; block addons stack above or below it (for textareas). */
    align?: "inline-start" | "inline-end" | "block-start" | "block-end";
  };
function InputGroupAddon({
  className,
  align = "inline-start",
  onClick,
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(addonVariants({ align }), className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || (event.target as HTMLElement).closest("button, a")) return;
        event.currentTarget.parentElement
          ?.querySelector<HTMLElement>("[data-slot=input-group-control]")
          ?.focus();
      }}
      {...props}
    />
  );
}

const buttonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-[5px] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
      sm: "h-7 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
      "icon-xs": "size-6 rounded-[5px] p-0",
      "icon-sm": "size-7 rounded-md p-0",
    },
    variant: {
      ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  },
  defaultVariants: { size: "xs", variant: "ghost" },
});

type InputGroupButtonProps = Omit<React.ComponentProps<"button">, "size"> &
  VariantProps<typeof buttonVariants>;
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: InputGroupButtonProps) {
  return (
    <button
      type={type}
      data-slot="input-group-button"
      data-size={size}
      className={cn(
        buttonVariants({ variant, size }),
        "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

type InputGroupTextProps = React.ComponentProps<"span">;
function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

type InputGroupInputProps = React.ComponentProps<"input">;
function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        "group-has-[[data-align=inline-start]]/input-group:pl-1.5 group-has-[[data-align=inline-end]]/input-group:pr-1.5",
        className,
      )}
      {...props}
    />
  );
}

type InputGroupTextareaProps = React.ComponentProps<"textarea">;
function InputGroupTextarea({ className, ...props }: InputGroupTextareaProps) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "min-h-16 w-full min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
  type InputGroupProps,
  type InputGroupAddonProps,
  type InputGroupButtonProps,
  type InputGroupTextProps,
  type InputGroupInputProps,
  type InputGroupTextareaProps,
};
