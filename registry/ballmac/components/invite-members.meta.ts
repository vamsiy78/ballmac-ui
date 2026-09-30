import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "invite-members",
  type: "registry:ui",
  title: "Invite Members",
  description:
    "Invite teammates by email: type or paste addresses into chips, flag invalid or duplicate ones with an explanation, pick a role, send, and manage pending invitations.",
  category: "saas",
  tags: ["invite", "team", "email", "roles"],
  files: [{ path: "components/invite-members.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "invite-members-demo", title: "With pending invitations", file: "invite-members-demo.tsx" },
    { name: "invite-members-states", title: "Minimal", file: "invite-members-states.tsx" },
  ],
  ai: {
    summary:
      "roles[], onInvite(invitations), pending[], onResend/onRevoke, existing[]. Addresses split on comma, space, semicolon or Enter and validate as you go.",
    whenToUse: ["Team and workspace settings", "Onboarding step for inviting colleagues"],
    whenNotToUse: ["Searching existing users; use combobox", "Single email field; use input"],
    composesWith: ["team-switcher", "settings-panel", "avatar"],
    a11y: [
      { keys: "Enter / comma / space", action: "Turns typed text into a chip" },
      { keys: "Backspace", action: "Removes the last chip when the field is empty" },
      { keys: "Screen readers", action: "Invalid chips announce the problem; results are a polite status" },
    ],
    customization: ["roles and defaultRole", "existing emails", "max per batch", "title and description"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
