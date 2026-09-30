// Ballmac UI: User Menu. https://ui.ballmac.com/components/user-menu
"use client";

import * as React from "react";
import { ChevronsUpDown, LogOut, Monitor, Moon, Palette, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, type AvatarProps } from "@/components/ballmac/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ballmac/dropdown-menu";
import { cn } from "@/lib/utils";

type UserMenuUser = {
  name: string;
  email: string;
  /** Avatar image URL. Initials show while it loads or if it fails. */
  image?: string;
  /** Plan label shown as a badge in the menu header, for example "Pro". */
  plan?: string;
  /** Presence dot on the avatar. */
  status?: AvatarProps["status"];
};

type UserMenuItem = {
  label: string;
  /** Navigates when set. */
  href?: string;
  /** Runs when chosen. */
  onSelect?: () => void;
  icon?: React.ReactNode;
  /** Keys shown at the end. Display only. */
  shortcut?: string;
  /** Small text at the end, for example "3 new". */
  badge?: string;
};

type UserMenuTheme = "light" | "dark" | "system";

type UserMenuProps = Omit<React.ComponentProps<"button">, "children"> & {
  user: UserMenuUser;
  /** Groups of items, shown in order with dividers between them. */
  groups?: UserMenuItem[][];
  /** Current theme. Adds a Theme submenu when `onThemeChange` is also set. */
  theme?: UserMenuTheme;
  /** Called with the chosen theme. */
  onThemeChange?: (theme: UserMenuTheme) => void;
  /** Adds a destructive "Sign out" item at the end. */
  onSignOut?: () => void;
  /** Trigger style: just the avatar, or avatar with name and email (for sidebars). */
  variant?: "avatar" | "full";
  /** Menu alignment relative to the trigger. */
  align?: "start" | "center" | "end";
  /** Side of the trigger the menu opens on. */
  side?: "top" | "right" | "bottom" | "left";
  /** Open state, for controlled use. */
  open?: boolean;
  /** Initial open state. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Trap interaction inside the menu while open. Turn off to keep the page usable, for example in a docs preview. */
  modal?: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function UserAvatar({ user, size }: { user: UserMenuUser; size?: AvatarProps["size"] }) {
  return (
    <Avatar size={size} status={user.status}>
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * An account menu: avatar (or avatar with name) opens a card-style header, your links, an optional theme picker and sign out.
 * Built on the dropdown menu, so arrow keys, typeahead and Escape work, and the avatar's alt text is the person's name.
 */
function UserMenu({
  user,
  groups = [],
  theme,
  onThemeChange,
  onSignOut,
  variant = "avatar",
  align = "end",
  side = "bottom",
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  className,
  ...props
}: UserMenuProps) {
  return (
    <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger
        data-slot="user-menu"
        aria-label={variant === "avatar" ? `Account menu for ${user.name}` : undefined}
        className={cn(
          variant === "avatar"
            ? "rounded-full outline-none transition-shadow hover:ring-4 hover:ring-ring/15 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:ring-4 data-[state=open]:ring-ring/20"
            : "flex w-full min-w-0 items-center gap-3 rounded-xl border bg-background p-2 pr-3 text-left shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent",
          className,
        )}
        {...props}
      >
        <UserAvatar user={user} />
        {variant === "full" && (
          <>
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
            <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-72 p-0">
        <div className="flex items-center gap-3 border-b bg-gradient-to-br from-chart-1/[0.08] to-transparent p-4">
          <UserAvatar user={user} size="lg" />
          <div className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          {user.plan && (
            <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
              {user.plan}
            </span>
          )}
        </div>
        <div className="p-1">
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && <DropdownMenuSeparator />}
              <DropdownMenuGroup>
                {group.map((item) => {
                  const inner = (
                    <>
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-muted px-1.5 py-px text-[10px] font-semibold text-muted-foreground">{item.badge}</span>
                      )}
                      {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                    </>
                  );
                  // createElement keeps `asChild` out of JSX (the shadcn CLI rewrites it for Base UI projects and would break this
                  // Radix-based menu). The item renders as the link itself, so there is one interactive element, not two.
                  return item.href ? (
                    React.createElement(
                      DropdownMenuItem,
                      { key: item.label, asChild: true, onSelect: item.onSelect },
                      <a href={item.href}>{inner}</a>,
                    )
                  ) : (
                    <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
                      {inner}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </React.Fragment>
          ))}
          {theme && onThemeChange && (
            <>
              {groups.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette aria-hidden="true" />
                  Theme
                  <span className="ml-auto pr-1 text-xs text-muted-foreground capitalize">{theme}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={(v) => onThemeChange(v as UserMenuTheme)}>
                    {THEMES.map(({ value, label, icon: Icon }) => (
                      <DropdownMenuRadioItem key={value} value={value}>
                        <Icon aria-hidden="true" />
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
          {onSignOut && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={onSignOut}>
                <LogOut aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu, type UserMenuProps, type UserMenuUser, type UserMenuItem, type UserMenuTheme };
