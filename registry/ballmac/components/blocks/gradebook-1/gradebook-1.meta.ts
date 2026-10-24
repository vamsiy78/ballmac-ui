import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "gradebook-1",
  type: "registry:block",
  title: "Gradebook 1: class grades",
  description:
    "A teacher's gradebook: students down, assignments across, type a score and the weighted average and letter grade update, ungraded work is left out rather than counted as zero, failing students are marked in words, a bad score is refused.",
  category: "blocks",
  blockCategory: "gradebook",
  tags: ["education", "gradebook", "grades", "school", "teacher", "weighted average", "class", "students"],
  files: [{ path: "components/blocks/gradebook-1/gradebook-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view"],
  examples: [
    { name: "gradebook-1-demo", title: "Default", file: "gradebook-1-demo.tsx" },
    { name: "gradebook-1-ungraded", title: "Part graded", file: "gradebook-1-ungraded.tsx" },
    { name: "gradebook-1-loading", title: "Loading", file: "gradebook-1-loading.tsx" },
    { name: "gradebook-1-empty", title: "No students yet", file: "gradebook-1-empty.tsx" },
    { name: "gradebook-1-error", title: "Could not load", file: "gradebook-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "gradebook-1-loading", trigger: "state=\"loading\"", note: "Skeleton grid under the real heading, announced as loading." },
    { id: "empty", title: "No students yet", example: "gradebook-1-empty", trigger: "state=\"empty\"", note: "Says no students yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "gradebook-1-error", trigger: "state=\"error\"", note: "An alert saying no score was changed, with Try again (onRetry). A score that fails to save is put back and says why." },
  ],
  ai: {
    summary:
      "Gradebook. <Gradebook1 students={[{ id, name }]} assignments={[{ id, title, max, weight }]} scores={{ 'studentId:assignmentId': 18 }} passMark={50} onScoreChange={(studentId, assignmentId, score|null) => Promise} />. Averages are weighted over graded work only. Scores above the maximum or below 0 are refused with a message.",
    whenToUse: ["A teacher's marking screen", "Any grid of people against weighted tasks"],
    whenNotToUse: ["A report card for parents", "A spreadsheet with free formulas; use data-grid"],
    composesWith: ["roster-1", "calendar-1", "inspection-1"],
    a11y: [
      { keys: "Grid", action: "A real table with row and column headers; each score is a labelled number field" },
      { keys: "Grade", action: "Average, letter and Failing are written as words" },
      { keys: "Error", action: "A refused score is an alert on that field; Escape restores the old score" },
      { keys: "Weights", action: "Shown in the column header text" },
    ],
    customization: ["students, assignments, scores", "passMark", "onScoreChange"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
