import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "quiz-1",
  type: "registry:block",
  title: "Quiz 1: questions with feedback",
  description:
    "A short quiz: one question at a time with progress, single or multiple answers, instant right or wrong with the reason, locked once checked, then a score against the pass mark with a review of every question and a retake.",
  category: "blocks",
  blockCategory: "quiz",
  tags: ["quiz", "questions", "test", "exam", "assessment", "learning", "score", "pass mark", "trivia", "knowledge check"],
  files: [{ path: "components/blocks/quiz-1/quiz-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button"],
  examples: [
    { name: "quiz-1-demo", title: "First question", file: "quiz-1-demo.tsx" },
    { name: "quiz-1-score", title: "Result, failed", file: "quiz-1-score.tsx" },
    { name: "quiz-1-empty", title: "No questions", file: "quiz-1-empty.tsx" },
  ],
  statesNone: "Self-contained: it holds its own answers and has nothing to load, submit or fail.",
  ai: {
    summary:
      "A quiz. <Quiz1 title questions={[{ id, prompt, options: [{ id, text }], answer: 'b' | ['a', 'd'], explanation }]} passMark={0.7} onComplete={({ score, total, passed, answers }) => ...} />. An answer array means choose all that apply (checkboxes); one id means radio buttons. Answers lock once checked. The result shows the score ring, pass or fail, and every question with what you chose when you were wrong.",
    whenToUse: ["A knowledge check at the end of a lesson", "A quick assessment or onboarding quiz"],
    whenNotToUse: ["Collecting opinions (use survey-1)", "Timed exams with proctoring"],
    composesWith: ["course-1", "onboarding-1", "app-shell-1"],
    a11y: [
      { keys: "Arrow keys / Space", action: "Options are real radio buttons or checkboxes; the group is named 'Choose one answer' or 'Choose all the answers that apply'" },
      { keys: "Checking", action: "The result is announced politely ('That is right' or 'Not quite' with the reason), and the correct and wrong options say so in words" },
      { keys: "Next", action: "Focus moves to the new question's heading, or to the result heading at the end" },
    ],
    customization: ["passMark sets the share needed", "onComplete fires once, after the last answer is checked", "Checked answers cannot be changed, so the review reflects what the person chose"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
