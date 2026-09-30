"use client";
import { WorkspaceCard } from "@/components/ballmac/workspace-card";
const members = [{ name: "Ana Lima" }, { name: "Kofi Mensah" }, { name: "Mei Tanaka" }, { name: "Sam Okafor" }, { name: "Ivy Chen" }];
export default function WorkspaceCardDemo() {
  const actions = [
    { label: "Workspace settings", onSelect: () => undefined },
    { label: "Invite people", onSelect: () => undefined },
    { label: "Leave workspace", onSelect: () => undefined, destructive: true },
  ];
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <WorkspaceCard
        current
        href="#acme"
        actions={actions}
        workspace={{ name: "Acme Inc.", description: "Product, design and engineering in one place.", plan: "Team", members, memberCount: 12, projects: 18, storage: { used: 62, total: 100, unit: "GB" }, lastActive: "Active 2 hours ago" }}
      />
      <WorkspaceCard
        href="#labs"
        actions={actions}
        workspace={{ name: "Orbit Studio", description: "Client work and experiments.", plan: "Free", members: members.slice(0, 3), projects: 4, storage: { used: 9, total: 10, unit: "GB" }, lastActive: "Active yesterday" }}
      />
    </div>
  );
}
