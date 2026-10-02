// Ballmac UI: Notification Center. https://ui.ballmac.com/components/notification-center
"use client";

import * as React from "react";
import { Bell, BellOff, Check, CheckCheck, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ballmac/popover";
import { spring } from "@/lib/ballmac/motion";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";

type NotificationItem = {
  /** Unique id. */
  id: string;
  /** What happened, for example "Ana commented on Launch plan". */
  title: string;
  /** Optional detail line. */
  description?: string;
  /** Time text such as "5m" or "Yesterday". */
  time: string;
  /** Group heading such as "Today". Items with the same group are listed together, in order. */
  group?: string;
  /** Whether it was read. */
  read?: boolean;
  /** Leading icon or avatar. */
  icon?: React.ReactNode;
  /** Makes the row a link. */
  href?: string;
};

type NotificationCenterProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  /** Notifications, newest first. */
  notifications: NotificationItem[];
  /** Called when one is marked read (by opening it or with the check button). */
  onMarkRead?: (id: string) => void;
  /** Called by "Mark all as read". */
  onMarkAllRead?: () => void;
  /** Adds a dismiss button on each row. */
  onDismiss?: (id: string) => void;
  /** Called when a row is chosen. */
  onOpenItem?: (item: NotificationItem) => void;
  /** Open state, for controlled use. */
  open?: boolean;
  /** Initial open state. */
  defaultOpen?: boolean;
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the bell button. The unread count is added. */
  label?: string;
  /** Message when there is nothing to show. */
  emptyText?: string;
  /** Side of the bell the panel opens on. */
  align?: "start" | "center" | "end";
};

/**
 * A bell with an unread badge that opens a panel of notifications, grouped by day with All and Unread views.
 * The count is part of the button's accessible name, new items are announced politely, and every row is keyboard reachable.
 */
function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onOpenItem,
  open,
  defaultOpen,
  onOpenChange,
  label,
  emptyText,
  align = "end",
  className,
  ...props
}: NotificationCenterProps) {
  const msg = useMessages()
  label ??= msg("notification-center.label", "Notifications")
  emptyText ??= msg("notification-center.emptyText", "You're all caught up.")
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<"all" | "unread">("all");
  const unread = notifications.filter((n) => !n.read).length;
  const shown = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const groups = shown.reduce<Array<{ name: string; items: NotificationItem[] }>>((acc, item) => {
    const name = item.group ?? "";
    const last = acc.at(-1);
    if (last && last.name === name) last.items.push(item);
    else acc.push({ name, items: [item] });
    return acc;
  }, []);

  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger
        data-slot="notification-center"
        aria-label={unread ? `${label}, ${unread} unread` : label}
        className={cn(
          "relative inline-flex size-10 items-center justify-center rounded-full border bg-background text-foreground shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent",
          className,
        )}
        {...props}
      >
        <Bell aria-hidden="true" className="size-[18px]" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              aria-hidden="true"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 0 }}
              transition={spring.bouncy}
              className="absolute -top-1 -end-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white tabular-nums ring-2 ring-background"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </PopoverTrigger>
      <PopoverContent
        label={label}
        align={align}
        className="w-[min(25rem,calc(100vw-1.5rem))] gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2">
          <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={!unread}
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCheck aria-hidden="true" className="size-3.5" /> {msg("notification-center.markAllAsRead", "Mark all as read")}
          </button>
        </div>
        <div role="tablist" aria-label={msg("notification-center.filterNotifications", "Filter notifications")} className="flex gap-1 border-b px-3">
          {(["all", "unread"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "relative -mb-px flex h-9 items-center gap-1.5 px-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "all" ? "All" : "Unread"}
              {t === "unread" && unread > 0 && (
                <span className="rounded-full bg-muted px-1.5 text-[11px] tabular-nums">{unread}</span>
              )}
              {tab === t && (
                <motion.span layoutId="notification-tab" className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-primary" transition={reduce ? { duration: 0 } : spring.snappy} />
              )}
            </button>
          ))}
        </div>

        <div role="tabpanel" aria-label={tab === "all" ? msg("notification-center.allNotifications", "All notifications") : msg("notification-center.unreadNotifications", "Unread notifications")} tabIndex={0} className="max-h-[22rem] overflow-y-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-muted-foreground">
              <BellOff aria-hidden="true" className="size-8 opacity-60" />
              <p className="text-sm">{tab === "unread" ? "No unread notifications." : emptyText}</p>
            </div>
          ) : (
            groups.map((group, gi) => (
              <div key={`${group.name}-${gi}`}>
                {group.name && (
                  <p className="sticky top-0 z-10 bg-popover/95 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur">
                    {group.name}
                  </p>
                )}
                <ul aria-live="polite">
                  <AnimatePresence initial={false}>
                    {group.items.map((n) => {
                      const Row = n.href ? "a" : "div";
                      return (
                        <motion.li
                          key={n.id}
                          initial={reduce ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                          transition={reduce ? { duration: 0 } : spring.snappy}
                          className="group/n relative"
                        >
                          <Row
                            {...(n.href ? { href: n.href } : { tabIndex: 0, role: "button" })}
                            onClick={() => {
                              onOpenItem?.(n);
                              if (!n.read) onMarkRead?.(n.id);
                            }}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (!n.href && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                onOpenItem?.(n);
                                if (!n.read) onMarkRead?.(n.id);
                              }
                            }}
                            className={cn(
                              "flex gap-3 px-4 py-3 pe-16 text-start outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50",
                              !n.read && "bg-chart-1/[0.05]",
                            )}
                          >
                            <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-4">
                              {n.icon ?? <Bell aria-hidden="true" />}
                              {!n.read && (
                                <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-chart-1 ring-2 ring-popover">
                                  <span className="sr-only">{msg("notification-center.unread", "Unread")}</span>
                                </span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={cn("block text-sm leading-snug", !n.read ? "font-medium" : "text-muted-foreground")}>{n.title}</span>
                              {n.description && <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-muted-foreground">{n.description}</span>}
                              <span className="mt-1 block text-xs text-muted-foreground tabular-nums">{n.time}</span>
                            </span>
                          </Row>
                          <div className="absolute top-2.5 end-2 flex gap-0.5 opacity-0 transition-opacity group-focus-within/n:opacity-100 group-hover/n:opacity-100 motion-reduce:transition-none">
                            {!n.read && onMarkRead && (
                              <button
                                type="button"
                                aria-label={msg("notification-center.markAsRead", "Mark \"{title}\" as read", { title: n.title })}
                                onClick={() => onMarkRead(n.id)}
                                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              >
                                <Check aria-hidden="true" className="size-3.5" />
                              </button>
                            )}
                            {onDismiss && (
                              <button
                                type="button"
                                aria-label={msg("notification-center.dismiss", "Dismiss \"{title}\"", { title: n.title })}
                                onClick={() => onDismiss(n.id)}
                                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-background hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-ring/50"
                              >
                                <X aria-hidden="true" className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { NotificationCenter, type NotificationCenterProps, type NotificationItem };
