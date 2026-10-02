// Ballmac UI: Team Switcher. https://ui.ballmac.com/components/team-switcher
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ballmac/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/ballmac/i18n";
import { Media, isMediaImage, type MediaSource } from "@/components/ballmac/media";

type Team = {
  /** Unique id; used for `value`. */
  id: string;
  /** Team or workspace name. */
  name: string;
  /** Secondary line, such as the plan or member count. */
  description?: string;
  /** Logo or avatar: an image URL, an object with alt text and a dark-mode file, or any element. Defaults to the first letter of the name. */
  logo?: MediaSource;
};

type TeamSwitcherProps = Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange"> & {
  /** Teams to choose from. */
  teams: Team[];
  /** Controlled selected team id. */
  value?: string;
  /** Initial team id when uncontrolled. */
  defaultValue?: string;
  /** Called with the chosen team id. */
  onValueChange?: (id: string) => void;
  /** Shows an "Add team" row at the end of the menu and calls this when chosen. */
  onAddTeam?: () => void;
  /** Label of the add row. */
  addLabel?: string;
  /** Show only the logo (for a collapsed sidebar). The name stays available to screen readers. */
  compact?: boolean;
  /** Menu alignment relative to the trigger. */
  align?: "start" | "center" | "end";
  /** Side of the trigger the menu opens on. */
  side?: "top" | "right" | "bottom" | "left";
};

function Logo({ team, className }: { team: Team; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-semibold text-primary-foreground [&_svg]:size-4",
        className,
      )}
    >
      {isMediaImage(team.logo) ? <Media media={team.logo} alt="" fit="contain" fill className="size-full" /> : (team.logo ?? team.name.charAt(0).toUpperCase())}
    </span>
  );
}

/** A workspace picker: the current team on a button, the others in a radio menu, and an optional add row. */
function TeamSwitcher({
  teams,
  value: valueProp,
  defaultValue,
  onValueChange,
  onAddTeam,
  addLabel,
  compact = false,
  align = "start",
  side = "bottom",
  className,
  ...props
}: TeamSwitcherProps) {
  const msg = useMessages()
  addLabel ??= msg("team-switcher.addLabel", "Add team")
  const [inner, setInner] = React.useState(defaultValue ?? teams[0]?.id);
  const value = valueProp ?? inner;
  const active = teams.find((t) => t.id === value) ?? teams[0];
  if (!active) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="team-switcher"
        aria-label={compact ? `Team: ${active.name}` : undefined}
        className={cn(
          "flex w-full min-w-0 items-center gap-2.5 rounded-lg border bg-background p-1.5 pe-2 text-start shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent",
          compact && "size-11 justify-center p-1.5 pe-1.5",
          className,
        )}
        {...props}
      >
        <Logo team={active} />
        {!compact && (
          <>
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-semibold">{active.name}</span>
              {active.description && <span className="truncate text-xs text-muted-foreground">{active.description}</span>}
            </span>
            <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-(--radix-dropdown-menu-trigger-width) min-w-60">
        <DropdownMenuLabel>{msg("team-switcher.teams", "Teams")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(id) => {
            if (valueProp === undefined) setInner(id);
            onValueChange?.(id);
          }}
        >
          {teams.map((team) => (
            <DropdownMenuRadioItem key={team.id} value={team.id} className="gap-2.5 py-1.5 ps-2 [&>span:first-child]:hidden">
              <Logo team={team} className="size-7 rounded-md text-xs" />
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm">{team.name}</span>
                {team.description && <span className="truncate text-xs text-muted-foreground">{team.description}</span>}
              </span>
              {team.id === value && <Check aria-hidden="true" className="ms-auto size-4 !text-foreground" />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {onAddTeam && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onAddTeam} className="gap-2.5 py-1.5">
              <span className="flex size-7 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                <Plus aria-hidden="true" className="size-4" />
              </span>
              {addLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { TeamSwitcher, type TeamSwitcherProps, type Team };
