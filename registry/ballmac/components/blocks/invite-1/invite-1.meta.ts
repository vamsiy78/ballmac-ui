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
  registryDependencies: ["shadcn:utils", "badge", "button", "media", "use-resource"],
  examples: [{ name: "invite-1-demo", title: "Pending", file: "invite-1-demo.tsx" },
    { name: "invite-1-expired", title: "Expired", file: "invite-1-expired.tsx" },
    { name: "invite-1-joining", title: "Joining", file: "invite-1-joining.tsx" },
    { name: "invite-1-welcome", title: "Welcome", file: "invite-1-welcome.tsx" },
    { name: "invite-1-error", title: "Could not join", file: "invite-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Joining", example: "invite-1-joining", trigger: "state=\"submitting\"", note: "Every field and button is disabled while the request is in flight, the button shows a spinner, and the form is marked busy." },
    { id: "success", title: "Welcome", example: "invite-1-welcome", trigger: "state=\"success\"", note: "The confirmation screen the flow ends on." },
    { id: "error", title: "Could not join", example: "invite-1-error", trigger: "state=\"error\"", note: "An alert above the form with the message (errorState.description to change it); the fields stay editable so it can be fixed." },
    { id: "expired", title: "Expired", example: "invite-1-expired", trigger: "status=\"expired\"", note: "The invitation has run out: the page says so and offers to ask for a new one." },
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
    customization: ["status: 'expired' shows the request-a-new-link flow", "onDecline / onSwitchAccount: null hides them", "access: [] hides the list", "state: \"submitting\" | \"success\" | \"error\" (omit it and the form runs by itself); errorState.description sets the failure message. Pair with your own async handler: state={pending ? \"submitting\" : failed ? \"error\" : done ? \"success\" : undefined}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (submitting, success, error) to drive the form from your own async code, and defaultValues or defaultEmail to prefill. Fields lock while a request is in flight. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
