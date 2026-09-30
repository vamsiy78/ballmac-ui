import { Building2, Leaf, Rocket } from "lucide-react";
import { TeamSwitcher } from "@/components/ballmac/team-switcher";
const teams = [
  { id: "hq", name: "Headquarters", description: "Enterprise", logo: <Building2 /> },
  { id: "green", name: "Green Team", description: "Team", logo: <Leaf /> },
  { id: "launch", name: "Launch Crew", description: "Pro", logo: <Rocket /> },
];
export default function TeamSwitcherStates() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-3">
      <div className="w-14">
        <TeamSwitcher teams={teams} compact side="right" />
      </div>
      <p className="max-w-56 text-sm text-muted-foreground">Compact mode for a collapsed sidebar. The menu opens to the side.</p>
    </div>
  );
}
