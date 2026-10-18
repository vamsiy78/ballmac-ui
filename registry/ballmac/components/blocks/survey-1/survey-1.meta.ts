import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "survey-1",
  type: "registry:block",
  title: "Survey 1: NPS feedback",
  description:
    "A three-question feedback card: the 0 to 10 recommend question as big buttons, a follow-up that changes with the answer, an optional comment, a progress bar, Back that keeps answers, and a failed send that keeps what was typed.",
  category: "blocks",
  blockCategory: "survey",
  tags: ["survey", "nps", "feedback", "score", "rating", "customer satisfaction", "csat", "poll", "form"],
  files: [{ path: "components/blocks/survey-1/survey-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "textarea", "use-resource"],
  examples: [
    { name: "survey-1-demo", title: "Default", file: "survey-1-demo.tsx" },
    { name: "survey-1-sending", title: "Sending", file: "survey-1-sending.tsx" },
    { name: "survey-1-sent", title: "Thank you", file: "survey-1-sent.tsx" },
    { name: "survey-1-error", title: "Could not send", file: "survey-1-error.tsx" },
  ],
  states: [
    { id: "submitting", title: "Sending", example: "survey-1-sending", trigger: "state=\"submitting\"", note: "The comment and buttons are disabled, Send shows a spinner and the card is marked busy." },
    { id: "success", title: "Thank you", example: "survey-1-sent", trigger: "state=\"success\"", note: "The progress bar fills and the card thanks the person; the words change for a fan and for someone who was unhappy." },
    { id: "error", title: "Could not send", example: "survey-1-error", trigger: "state=\"error\"", note: "An alert on the last step saying nothing was lost, with Try again; every answer is still there." },
  ],
  ai: {
    summary:
      "An NPS survey card. <Survey1 product='Acme' lowReasons highReasons onSubmit={({ score, reasons, comment, mayContact }) => Promise} />. Scores 9 and 10 get the high reasons ('What do you like most?'), everything else the low ones. Reject onSubmit to show the error with the answers kept. Pass state to drive it, or leave it out to run by itself.",
    whenToUse: ["A feedback page linked from an email", "Asking for NPS after onboarding or a milestone"],
    whenNotToUse: ["A floating widget in the app (use feedback-widget)", "A long, multi-section form"],
    composesWith: ["contact-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, then arrow keys", action: "The scores are a radio group with one tab stop; arrows move and choose, and each is read with its number (0 as not at all likely, 10 as extremely likely)" },
      { keys: "Next / Back", action: "Focus moves to the new question's heading so nothing is lost when the step changes" },
      { keys: "Progress", action: "A labelled progress bar and 'Question 2 of 3' in text" },
    ],
    customization: ["lowReasons and highReasons are plain arrays", "The mood line under the scale says what the score means in words", "Back keeps every answer; changing between happy and unhappy clears only the reasons, which no longer apply"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
