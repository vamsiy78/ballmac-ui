// Ballmac UI: Alert Dialog. https://ui.ballmac.com/components/alert-dialog
"use client";

import * as React from "react";
import { AlertDialog as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

type AlertDialogProps = React.ComponentProps<typeof Primitive.Root>;
function AlertDialog(props: AlertDialogProps) {
  return <Primitive.Root data-slot="alert-dialog" {...props} />;
}

type AlertDialogTriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
function AlertDialogTrigger({ className, ...props }: AlertDialogTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="alert-dialog-trigger"
      className={className}
      {...props}
    />
  );
}

type AlertDialogContentProps = React.ComponentProps<
  typeof Primitive.Content
> & {
  /** Width of the confirmation panel. */
  size?: "default" | "sm";
};
function AlertDialogContent({
  className,
  children,
  size = "default",
  ...props
}: AlertDialogContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay
        data-slot="alert-dialog-overlay"
        className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none"
      />
      <Primitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-xl border bg-card p-5 text-card-foreground shadow-[0_24px_48px_-12px_rgb(0_0_0/0.25)] outline-none sm:p-6",
          "data-[size=default]:max-w-md data-[size=sm]:max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  );
}

type AlertDialogHeaderProps = React.ComponentProps<"div">;
function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}
type AlertDialogMediaProps = React.ComponentProps<"div">;
function AlertDialogMedia({ className, ...props }: AlertDialogMediaProps) {
  return (
    <div
      data-slot="alert-dialog-media"
      aria-hidden="true"
      className={cn(
        "flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive [&_svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}
type AlertDialogTitleProps = React.ComponentProps<typeof Primitive.Title>;
function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <Primitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}
type AlertDialogDescriptionProps = React.ComponentProps<
  typeof Primitive.Description
>;
function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <Primitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}
type AlertDialogFooterProps = React.ComponentProps<"div">;
function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
type AlertDialogCancelProps = React.ComponentProps<typeof Primitive.Cancel>;
function AlertDialogCancel({ className, ...props }: AlertDialogCancelProps) {
  return (
    <Primitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium outline-none transition-colors duration-150 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
type AlertDialogActionProps = React.ComponentProps<typeof Primitive.Action> & {
  /** Highlight a destructive commitment with the semantic destructive token. */
  destructive?: boolean;
};
function AlertDialogAction({
  className,
  destructive = false,
  ...props
}: AlertDialogActionProps) {
  return (
    <Primitive.Action
      data-slot="alert-dialog-action"
      data-destructive={destructive}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 data-[destructive=true]:bg-destructive data-[destructive=true]:text-white data-[destructive=true]:hover:bg-destructive/90 dark:data-[destructive=true]:bg-destructive/60 dark:data-[destructive=true]:hover:bg-destructive/50 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  type AlertDialogProps,
  type AlertDialogTriggerProps,
  type AlertDialogContentProps,
  type AlertDialogHeaderProps,
  type AlertDialogMediaProps,
  type AlertDialogTitleProps,
  type AlertDialogDescriptionProps,
  type AlertDialogFooterProps,
  type AlertDialogCancelProps,
  type AlertDialogActionProps,
};
