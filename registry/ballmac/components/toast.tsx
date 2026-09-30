// Ballmac UI: Toast. https://ui.ballmac.com/components/toast
// Based on shadcn/ui Sonner (MIT, Copyright (c) 2023 shadcn) on Sonner (MIT, Copyright (c) 2023 Emil Kowalski), restyled with theme tokens (so it follows the site's light and dark mode without a theme provider), status icons, and accessible action buttons.
"use client";

import * as React from "react";
import { CircleAlert, CircleCheck, Info, Loader, TriangleAlert, X } from "lucide-react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Mount once near the root of your app. Call `toast("Saved")`, `toast.success(...)`, `toast.error(...)`,
 * `toast.promise(...)` or `toast.custom(...)` from anywhere. Toasts are announced to screen readers,
 * pause while hovered or focused, and can be dismissed with Escape after pressing Alt+T to focus the region.
 */
function Toaster({ toastOptions, icons, ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      closeButton
      icons={{
        success: <CircleCheck aria-hidden="true" className="size-4 text-chart-2" />,
        info: <Info aria-hidden="true" className="size-4 text-primary" />,
        warning: <TriangleAlert aria-hidden="true" className="size-4 text-chart-3" />,
        error: <CircleAlert aria-hidden="true" className="size-4 text-destructive" />,
        loading: <Loader aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />,
        close: <X aria-hidden="true" className="size-3.5" />,
        ...icons,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl, 0.75rem)",
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: "!shadow-[0_12px_36px_-10px_rgb(0_0_0/0.25)] !gap-3 !p-4 !font-sans",
          title: "!text-sm !font-medium",
          description: "!text-sm !text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground !rounded-md !h-8 !px-3 !text-[13px] !font-medium focus-visible:!ring-[3px] focus-visible:!ring-ring/50",
          cancelButton: "!bg-muted !text-foreground !rounded-md !h-8 !px-3 !text-[13px] !font-medium focus-visible:!ring-[3px] focus-visible:!ring-ring/50",
          closeButton: "!bg-popover !border-border !text-muted-foreground hover:!text-foreground",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast, type ToasterProps };
