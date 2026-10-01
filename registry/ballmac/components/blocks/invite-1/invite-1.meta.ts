import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "invite-1",
  type: "registry:block",
  title: "Invite 1: accept a team invitation",
  description: "The page an invitation email opens: workspace tile, who invited you, your role and what it allows, the account being used, accept and decline, with welcome, declined and expired states.",
  category: "blocks",
  blockCategory: "onboarding",
  tags: ["invite", "invitation", "team", "workspace", "accept", "join"],
  files: [{ path: "components/blocks/invite-1/invite-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "button"],
  examples: [
    { name: "invite-1-demo", title: "Pending", file: "invite-1-demo.tsx" },
    { name: "invite-1-expired", title: "Expired", file: "invite-1-expired.tsx" },
  ],
  ai: {
    summary: "Landing page for an emailed invitation. Pass workspace, inviter, role, email, access, onAccept / onDecline / onRequestNew (throw to show an error) and status ('pending' | 'expired').",
    whenToUse: ["Team and workspace invitations", "Sharing links that need an explicit accept"],
    whenNotToUse: ["Sending invitations (use invite-members)"],
    composesWith: ["signup-1", "login-2", "onboarding-1", "verify-1"],
    a11y: [
      { keys: "Accept / Decline", action: "Focus moves to the new heading and the result is announced as a status" },
      { keys: "Errors", action: "A failed action is announced as an alert" },
    ],
    customization: ["status: 'expired' shows the request-a-new-link flow", "onDecline / onSwitchAccount: null hides them", "access: [] hides the list"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
