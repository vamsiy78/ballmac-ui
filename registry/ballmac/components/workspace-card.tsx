// Ballmac UI: Workspace Card. https://ui.ballmac.com/components/workspace-card
"use client";

import * as React from "react";
import { ArrowUpRight, Check, FolderKanban, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ballmac/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ballmac/dropdown-menu";
import { cn } from "@/lib/utils";

type WorkspaceMember = {
  name: string;
  image?: string;
};

type WorkspaceAction = {
  label: string;
  onSelect: () => void;
  /** Style as a destructive action, for example "Leave workspace". */
  destructive?: boolean;
};

type Workspace = {
  name: string;
  /** One line about the workspace. */
  description?: string;
  /** Plan label, for example "Team". */
  plan?: string;
  /** A few members to show as faces. */
  members?: WorkspaceMember[];
  /** Total members, when more than `members` lists. */
  memberCount?: number;
  /** Number of projects. */
  projects?: number;
  /** Storage in use and included, with a unit. */
  storage?: { used: number; total: number; unit: string };
  /** Text such as "Active 2 hours ago". */
  lastActive?: string;
};

type WorkspaceCardProps = Omit<React.ComponentProps<"article">, "children"> & {
  /** The workspace to show. Optional only while `loading`. */
  workspace?: Workspace;
  /** Where the card goes when opened. Makes the whole card clickable through its title. */
  href?: string;
  /** Called when the title button is pressed (when no `href`). */
  onOpen?: () => void;
  /** Mark as the workspace you are in now. */
  current?: boolean;
  /** Entries for the "more" menu. Leave empty to hide the menu. */
  actions?: WorkspaceAction[];
  /** Show a placeholder while data loads. */
  loading?: boolean;
};

const COVERS = [
  "from-chart-1/40 via-chart-4/25 to-chart-5/20",
  "from-chart-2/40 via-chart-1/25 to-chart-4/20",
  "from-chart-3/40 via-chart-5/25 to-chart-2/20",
  "from-chart-4/40 via-chart-2/25 to-chart-3/20",
  "from-chart-5/40 via-chart-3/25 to-chart-1/20",
];
const TILES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * A card for one workspace or team: a generated cover and logo tile, plan, faces of members, project and storage
 * stats, and a menu of actions. The whole card is clickable through its title link, so the keyboard target is one clear link.
 */
function WorkspaceCard({
  workspace: workspaceProp,
  href,
  onOpen,
  current = false,
  actions = [],
  loading = false,
  className,
  ...props
}: WorkspaceCardProps) {
  if (loading) {
    return (
      <article
        data-slot="workspace-card"
        aria-busy="true"
        aria-label="Loading workspace"
        className={cn("overflow-hidden rounded-2xl border bg-card", className)}
        {...props}
      >
        <div className="h-20 animate-pulse bg-muted motion-reduce:animate-none" />
        <div className="grid gap-3 p-5 pt-8">
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-8 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
      </article>
    );
  }

  const workspace = workspaceProp ?? { name: "Workspace" };
  const h = hash(workspace.name);
  const cover = COVERS[h % COVERS.length];
  const tile = TILES[(h >> 3) % TILES.length];
  const storagePercent = workspace.storage ? Math.min(100, (workspace.storage.used / Math.max(workspace.storage.total, 1)) * 100) : 0;
  const total = workspace.memberCount ?? workspace.members?.length ?? 0;
  const titleClass =
    "rounded-sm text-base font-semibold tracking-tight outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50 focus-visible:after:rounded-2xl";

  return (
    <article
      data-slot="workspace-card"
      data-current={current || undefined}
      className={cn(
        "group/ws relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgb(0_0_0/0.3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        current && "border-primary/60",
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className={cn("relative h-20 bg-gradient-to-br", cover)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgb(255_255_255/0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgb(255_255_255/0.08),transparent_55%)]" />
      </div>
      {actions.length > 0 && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`${workspace.name} actions`}
              className="inline-flex size-8 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur outline-none transition-colors hover:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-background"
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {actions.map((a, i) => (
                <React.Fragment key={a.label}>
                  {a.destructive && i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem destructive={a.destructive} onSelect={a.onSelect}>
                    {a.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="relative px-5 pb-5">
        <span
          aria-hidden="true"
          className={cn(
            "-mt-7 flex size-14 items-center justify-center rounded-2xl text-xl font-semibold text-background shadow-[0_6px_16px_-4px_rgb(0_0_0/0.3)] ring-4 ring-card",
            tile,
          )}
        >
          {workspace.name.charAt(0).toUpperCase()}
        </span>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2">
              {href ? (
                <a href={href} className={titleClass}>
                  {workspace.name}
                </a>
              ) : (
                <button type="button" onClick={onOpen} className={cn(titleClass, "text-left")}>
                  {workspace.name}
                </button>
              )}
              {current && (
                <span className="relative inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} /> Current
                </span>
              )}
            </h3>
            {workspace.description && <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">{workspace.description}</p>}
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-[opacity,transform] group-hover/ws:translate-x-0.5 group-hover/ws:-translate-y-0.5 group-hover/ws:opacity-100 motion-reduce:transition-none"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {workspace.members && workspace.members.length > 0 ? (
            <AvatarGroup size="sm" max={4} total={total}>
              {workspace.members.map((m) => (
                <Avatar key={m.name}>
                  {m.image && <AvatarImage src={m.image} alt={m.name} />}
                  <AvatarFallback>{m.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          ) : (
            <span className="text-xs text-muted-foreground">{total} members</span>
          )}
          {workspace.plan && (
            <span className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs font-medium">{workspace.plan}</span>
          )}
        </div>

        {(workspace.projects !== undefined || workspace.storage) && (
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
            {workspace.projects !== undefined && (
              <div>
                <dt className="text-xs text-muted-foreground">Projects</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-medium tabular-nums">
                  <FolderKanban aria-hidden="true" className="size-3.5 text-muted-foreground" />
                  {workspace.projects}
                </dd>
              </div>
            )}
            {workspace.storage && (
              <div>
                <dt className="text-xs text-muted-foreground">Storage</dt>
                <dd className="mt-0.5 grid gap-1.5">
                  <span className="font-medium tabular-nums">
                    {workspace.storage.used} <span className="text-xs font-normal text-muted-foreground">/ {workspace.storage.total} {workspace.storage.unit}</span>
                  </span>
                  <span
                    role="meter"
                    aria-label="Storage used"
                    aria-valuemin={0}
                    aria-valuemax={workspace.storage.total}
                    aria-valuenow={workspace.storage.used}
                    className="h-1 overflow-hidden rounded-full bg-muted"
                  >
                    <span className={cn("block h-full rounded-full", storagePercent >= 90 ? "bg-destructive" : storagePercent >= 75 ? "bg-chart-3" : "bg-primary")} style={{ width: `${storagePercent}%` }} />
                  </span>
                </dd>
              </div>
            )}
          </dl>
        )}
        {workspace.lastActive && <p className="mt-3 text-xs text-muted-foreground">{workspace.lastActive}</p>}
      </div>
    </article>
  );
}

export { WorkspaceCard, type WorkspaceCardProps, type Workspace, type WorkspaceMember, type WorkspaceAction };
