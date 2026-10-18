import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "waitlist-1",
  type: "registry:block",
  title: "Waitlist 1: referral waitlist",
  description:
    "A launch waitlist that grows by referral: an email form with a count of who is waiting, then the person's place in line, their own share link to copy, and a ladder of rewards that fills as friends join.",
  category: "blocks",
  blockCategory: "waitlist",
  tags: ["waitlist", "launch", "referral", "early access", "signup", "invite", "viral", "coming soon", "pre-launch"],
  files: [{ path: "components/blocks/waitlist-1/waitlist-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "copy-button", "cover-art", "input", "number-ticker", "use-resource"],
  examples: [
    { name: "waitlist-1-demo", title: "Join form", file: "waitlist-1-demo.tsx" },
    { name: "waitlist-1-joined", title: "On the list", file: "waitlist-1-joined.tsx" },
    { name: "waitlist-1-sending", title: "Joining", file: "waitlist-1-sending.tsx" },
    { name: "waitlist-1-error", title: "Could not join", file: "waitlist-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Joining", example: "waitlist-1-sending", trigger: "state=\"submitting\"", note: "The field and button are disabled, the button says Joining with a spinner and the section is marked busy." },
    { id: "success", title: "On the list", example: "waitlist-1-joined", trigger: "state=\"success\"", note: "The second screen: place in line, share link and the reward ladder." },
    { id: "error", title: "Could not join", example: "waitlist-1-error", trigger: "state=\"error\"", note: "An alert saying the email is still there; the person can press Join again." },
  ],
  ai: {
    summary:
      "A referral waitlist. <Waitlist1 product='Acme' waiting={2431} rewards={[{ at: 3, title, description }]} onJoin={(email) => Promise<{ position, link, referrals }>} defaultJoined state />. After joining it shows #position, the share link with a copy button, and rewards that unlock as referrals reaches each at. Reject onJoin to show its message with the email kept.",
    whenToUse: ["A pre-launch landing page that collects emails", "Rolling out access in waves with referral rewards"],
    whenNotToUse: ["A newsletter signup (use newsletter-1)", "A full sign-up form (use auth blocks)"],
    composesWith: ["hero-1", "faq-1", "footer-1", "logo-cloud-1"],
    a11y: [
      { keys: "Submit", action: "An invalid email is announced as an alert and linked to the field; a failed join keeps the email" },
      { keys: "After joining", action: "Focus moves to the place in line, which is read as 'Number 1,284' with the message to follow" },
      { keys: "Rewards", action: "Each step says in words whether it is unlocked or how many more friends it needs" },
    ],
    customization: ["rewards: any number of steps by friends needed", "The share link and text are built for email and X; swap in your own channels", "The link is shown left to right even in right-to-left layouts, like any address"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
