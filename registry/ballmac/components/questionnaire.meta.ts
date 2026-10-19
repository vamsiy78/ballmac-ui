import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "questionnaire",
  type: "registry:ui",
  title: "Questionnaire",
  description:
    "A multi-step questionnaire with single-choice, multiple-choice, freeform and skippable questions, answer shortcuts, validation and native form data, built on shadcn's headless Questionnaire so the API is the same.",
  category: "ai",
  tags: ["questionnaire", "form", "wizard", "agent", "choices", "shortcuts", "shadcn"],
  files: [{ path: "components/questionnaire.tsx" }],
  dependencies: ["@shadcn/react@^0.3", "lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "i18n"],
  examples: [
    { name: "questionnaire-demo", title: "Steps with a freeform answer", file: "questionnaire-demo.tsx" },
    { name: "questionnaire-multiple", title: "Multiple selection", file: "questionnaire-multiple.tsx" },
    { name: "questionnaire-shortcuts", title: "Letter shortcuts", file: "questionnaire-shortcuts.tsx" },
    { name: "questionnaire-skip", title: "Optional and skippable", file: "questionnaire-skip.tsx" },
    { name: "questionnaire-validation", title: "Your own validation", file: "questionnaire-validation.tsx" },
    { name: "questionnaire-card", title: "In a card", file: "questionnaire-card.tsx" },
  ],
  statesNone: "It collects answers and hands them to onSubmit as form data; saving them, and any loading or failure around that, belongs to the page that owns the form.",
  ai: {
    summary:
      "<Questionnaire items onSubmit> with a <QuestionnaireItem name required> per question: Title, Description, Choices holding <QuestionnaireChoice value> and optionally <QuestionnaireInput aria-label>, and an Error. Add <QuestionnaireActions> with Previous, Skip, Next and Submit. Answers are native FormData.",
    whenToUse: [
      "An AI agent asking the person to choose between options before it continues",
      "Onboarding and intake steps with a few questions",
      "Surveys where answers become form data",
    ],
    whenNotToUse: [
      "One question inside a form; use radio-group or checkbox",
      "A long form with many field types; use form blocks",
      "Quizzes that score answers; compute that yourself from the form data",
    ],
    composesWith: ["card", "dialog", "trace", "button"],
    a11y: [
      { keys: "Tab / arrow keys", action: "Native radio and checkbox behavior in each question" },
      { keys: "Letter or number keys", action: "With shortcuts set, choose the answer with that key; it does not advance" },
      { keys: "Enter", action: "Next on a question, Submit on the last" },
      { keys: "Screen readers", action: "Each question is a fieldset named by its legend; descriptions and errors are linked; progress is a named progress bar; inactive questions are inert" },
      { keys: "After a failed step", action: "Focus goes to an answer of the question that needs one, and its error is announced" },
    ],
    customization: [
      "items to define the order, shortcuts, and server-rendered progress",
      "multiple on an item; QuestionnaireInput for a freeform answer",
      "item and onItemChange to control the active question",
      "invalid on an item with your own message in QuestionnaireError",
      "size and variant on the action buttons",
    ],
  },
  source: {
    name: "shadcn/ui Questionnaire",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
