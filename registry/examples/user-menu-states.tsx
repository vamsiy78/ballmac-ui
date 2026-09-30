"use client";
import { UserMenu } from "@/components/ballmac/user-menu";
export default function UserMenuStates() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-3">
      <UserMenu user={{ name: "Ana Lima", email: "ana@acme.example", status: "away" }} groups={[[{ label: "Profile", href: "#profile" }]]} onSignOut={() => undefined} />
      <p className="text-sm text-muted-foreground">Avatar-only trigger for headers. Initials appear when there is no photo.</p>
    </div>
  );
}
