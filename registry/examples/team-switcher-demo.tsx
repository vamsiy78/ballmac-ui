"use client";
import * as React from "react";
import { TeamSwitcher } from "@/components/ballmac/team-switcher";
const initial = [
  { id: "acme", name: "Acme Inc.", description: "Pro · 12 members" },
  { id: "design", name: "Design Lab", description: "Team · 5 members" },
  { id: "labs", name: "Orbit Studio", description: "Free · 3 members" },
];
export default function TeamSwitcherDemo() {
  const [teams, setTeams] = React.useState(initial);
  const [value, setValue] = React.useState("acme");
  return (
    <div className="grid w-full max-w-xs gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <TeamSwitcher
        teams={teams}
        value={value}
        onValueChange={setValue}
        onAddTeam={() => {
          const n = teams.length + 1;
          setTeams([...teams, { id: `team-${n}`, name: `New team ${n}`, description: "Free · 1 member" }]);
        }}
      />
      <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
        Working in <span className="font-medium text-foreground">{teams.find((t) => t.id === value)?.name}</span>
      </p>
    </div>
  );
}
