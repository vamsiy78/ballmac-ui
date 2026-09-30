"use client";
import { WorkspaceCard } from "@/components/ballmac/workspace-card";
export default function WorkspaceCardStates() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <WorkspaceCard loading />
      <WorkspaceCard onOpen={() => undefined} workspace={{ name: "Green Team", plan: "Pro", memberCount: 3, projects: 2 }} />
    </div>
  );
}
