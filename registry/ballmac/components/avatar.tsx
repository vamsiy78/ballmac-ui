// Ballmac UI: Avatar. https://ui.ballmac.com/components/avatar
// Based on shadcn/ui's Avatar (MIT, Copyright (c) 2023 shadcn), restyled with sizes, a status indicator and AvatarGroup.
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { useMessages, defineMessage } from "@/lib/ballmac/i18n"

const avatarVariants = cva(
  "relative flex shrink-0 select-none rounded-full bg-muted align-middle [&_[data-slot=avatar-fallback]]:font-medium",
  {
    variants: {
      size: {
        sm: "size-6 text-[10px]",
        default: "size-8 text-xs",
        lg: "size-11 text-sm",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>

const AvatarGroupContext = React.createContext<{ size?: AvatarSize } | null>(null)

const statusStyles = {
  online: { className: "bg-chart-2", label: defineMessage("avatar.statusStyles.online", "Online") },
  away: { className: "bg-chart-3", label: defineMessage("avatar.statusStyles.away", "Away") },
  busy: { className: "bg-destructive", label: defineMessage("avatar.statusStyles.busy", "Busy") },
  offline: { className: "bg-muted-foreground", label: defineMessage("avatar.statusStyles.offline", "Offline") },
} as const

type AvatarStatus = keyof typeof statusStyles

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants> & {
    /** Presence dot in the bottom-right corner. Announced to screen readers as text. */
    status?: AvatarStatus
    /** Overrides the screen reader text for the status (defaults to "Online", "Away", …). */
    statusLabel?: string
  }

function Avatar({ className, size, status, statusLabel, children, ...props }: AvatarProps) {
  const msg = useMessages()
  const group = React.useContext(AvatarGroupContext)
  const resolvedSize = size ?? group?.size ?? "default"
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={resolvedSize}
      className={cn(avatarVariants({ size: resolvedSize }), group && "ring-2 ring-background", className)}
      {...props}
    >
      {children}
      {status ? (
        <span
          data-slot="avatar-status"
          data-status={status}
          className={cn(
            "absolute end-0 bottom-0 block rounded-full ring-2 ring-background",
            resolvedSize === "sm" ? "size-1.5" : resolvedSize === "lg" ? "size-3" : "size-2.5",
            statusStyles[status].className
          )}
        >
          <span className="sr-only">{statusLabel ?? msg.of(statusStyles[status].label)}</span>
        </span>
      ) : null}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground uppercase [&_svg:not([class*='size-'])]:size-[55%]",
        className
      )}
      {...props}
    />
  )
}

type AvatarGroupProps = React.ComponentProps<"div"> & {
  /** Size applied to every avatar in the group (an avatar's own size prop still wins). */
  size?: AvatarSize
  /** Show at most this many avatars, then a "+N" counter for the rest. */
  max?: number
  /** Total count when it's larger than the avatars you render (for example 128 members, 5 fetched). */
  total?: number
}

function AvatarGroup({ className, size = "default", max, total, children, ...props }: AvatarGroupProps) {
  const msg = useMessages()
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const visible = max !== undefined && max >= 0 ? items.slice(0, max) : items
  const hidden = Math.max((total ?? items.length) - visible.length, 0)
  const context = React.useMemo(() => ({ size }), [size])

  return (
    <AvatarGroupContext.Provider value={context}>
      <div
        data-slot="avatar-group"
        role="group"
        className={cn(
          "flex items-center",
          size === "sm" ? "-space-x-1.5" : size === "lg" ? "-space-x-3" : "-space-x-2",
          className
        )}
        {...props}
      >
        {visible}
        {hidden > 0 ? (
          <span
            data-slot="avatar-group-count"
            className={cn(
              avatarVariants({ size }),
              "items-center justify-center font-medium text-muted-foreground tabular-nums ring-2 ring-background"
            )}
          >
            <span aria-hidden="true">+{hidden}</span>
            <span className="sr-only">{msg("avatar.more", "{count} more", { count: hidden })}</span>
          </span>
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  )
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarImage, avatarVariants, type AvatarGroupProps, type AvatarProps, type AvatarStatus }
