import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "settings-3",
  type: "registry:block",
  title: "Settings 3: team members and roles",
  description: "Team management: a seats meter, an invite form with role, role filters and search, a member list with role selects, pending invitations and a confirm-before-remove dialog. Stacks cleanly on phones.",
  category: "blocks",
  blockCategory: "settings",
  tags: ["settings", "team", "members", "roles", "invite", "permissions", "seats"],
  files: [{ path: "components/blocks/settings-3/settings-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "avatar", "badge", "button", "dropdown-menu", "input", "search-field", "select"],
  examples: [
    { name: "settings-3-demo", title: "Default", file: "settings-3-demo.tsx" },
    { name: "settings-3-full", title: "Seats full", file: "settings-3-full.tsx" },
  ],
  ai: {
    summary: "Workspace member management. Pass members=[{ id, name, email, role, status, lastActive? }], roles, seats and onInvite / onRoleChange / onRemove; the Owner can't be changed or removed.",
    whenToUse: ["Workspace and organisation settings", "Any product with roles and seats"],
    whenNotToUse: ["A first-run invite step (use onboarding-1)", "Sending many invites at once (use invite-members)"],
    composesWith: ["app-shell-1", "settings-1", "billing-1", "invite-1"],
    a11y: [
      { keys: "Enter in the email field", action: "Sends the invitation; errors are announced and linked to the field" },
      { keys: "Role select", action: "Each is named 'Role for <person>'; changes are announced politely" },
      { keys: "Actions menu", action: "Opens a menu; removing asks for confirmation in an alert dialog" },
    ],
    customization: ["members, roles, seats", "onInvite(email, role) async; throw to show an error", "onRoleChange(id, role), onRemove(id)"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
