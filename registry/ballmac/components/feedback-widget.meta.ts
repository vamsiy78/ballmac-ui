import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "feedback-widget",
  type: "registry:ui",
  title: "Feedback Widget",
  description:
    "A feedback pill that opens a popover with five face ratings as a radio group, optional topic chips and a comment box, then a thank-you confirmation.",
  category: "saas",
  tags: ["feedback", "rating", "survey", "popover"],
  files: [{ path: "components/feedback-widget.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "popover"],
  examples: [
    { name: "feedback-widget-demo", title: "Floating widget", file: "feedback-widget-demo.tsx" },
    { name: "feedback-widget-states", title: "Helpful page, required comment", file: "feedback-widget-states.tsx" },
  ],
  ai: {
    summary:
      "<FeedbackWidget onSubmit topics question />. onSubmit receives {rating, message, topic}; return a promise to show sending. Dock it in a corner with your own positioning.",
    whenToUse: ["Collecting product feedback in-app", "Page 'was this helpful' prompts"],
    whenNotToUse: ["Long surveys", "Support requests; link to a help form"],
    composesWith: ["popover", "rating", "textarea"],
    a11y: [
      { keys: "Arrow keys", action: "Move between faces (native radios); each has a text label" },
      { keys: "Tab", action: "Topic chips, comment and Send are in order" },
      { keys: "Screen readers", action: "Success is announced as a status" },
    ],
    customization: ["topics", "question", "requireMessage", "closeAfter", "side and align"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
