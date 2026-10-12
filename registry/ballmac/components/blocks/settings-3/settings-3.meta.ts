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
  registryDependencies: ["shadcn:utils", "alert-dialog", "avatar", "badge", "button", "dropdown-menu", "input", "search-field", "select", "state-view", "skeleton"],
  examples: [{ name: "settings-3-demo", title: "Default", file: "settings-3-demo.tsx" },
    { name: "settings-3-full", title: "Seats full", file: "settings-3-full.tsx" },
    { name: "settings-3-loading", title: "Loading", file: "settings-3-loading.tsx" },
    { name: "settings-3-error", title: "Could not load", file: "settings-3-error.tsx" },
    { name: "settings-3-no-members", title: "Nobody yet", file: "settings-3-no-members.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "settings-3-loading", trigger: "state=\"loading\"", note: "A skeleton with the same shapes as the ready view, announced as loading; nothing is clickable." },
    { id: "empty", title: "Nobody yet", example: "settings-3-no-members", trigger: "state=\"empty\"", note: "The real page with nobody on the team, so inviting still works." },
    { id: "error", title: "Could not load", example: "settings-3-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
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
    customization: ["members, roles, seats", "onInvite(email, role) async; throw to show an error", "onRoleChange(id, role), onRemove(id)", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. Pair with useResource: state={r.state} onRetry={r.retry}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry and errorState: a skeleton of the invite row and member list, an error with retry, and the real page with nobody on the team. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
