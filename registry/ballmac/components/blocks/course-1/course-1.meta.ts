import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "course-1",
  type: "registry:block",
  title: "Course 1: curriculum and progress",
  description:
    "A course page: a hero with a progress ring and a Continue button for the next lesson, expandable modules with their own progress, lessons you can open or mark done, locked ones with the reason, and a certificate that unlocks at the end.",
  category: "blocks",
  blockCategory: "course",
  tags: ["course", "curriculum", "lessons", "learning", "progress", "modules", "lms", "education", "certificate", "training"],
  files: [{ path: "components/blocks/course-1/course-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "skeleton", "state-view"],
  examples: [
    { name: "course-1-demo", title: "Partly done", file: "course-1-demo.tsx" },
    { name: "course-1-new", title: "Not started", file: "course-1-new.tsx" },
    { name: "course-1-complete", title: "Finished", file: "course-1-complete.tsx" },
    { name: "course-1-loading", title: "Loading", file: "course-1-loading.tsx" },
    { name: "course-1-empty", title: "No lessons yet", file: "course-1-empty.tsx" },
    { name: "course-1-error", title: "Could not load", file: "course-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "course-1-loading", trigger: "state=\"loading\"", note: "A skeleton hero and module cards, announced as loading." },
    { id: "empty", title: "No lessons yet", example: "course-1-empty", trigger: "state=\"empty\" (or modules={[]})", note: "Says the first lessons are on their way; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "course-1-error", trigger: "state=\"error\"", note: "An alert saying progress is safe, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A course page. <Course1 title subtitle instructor={{ name, role }} level modules={[{ id, title, lessons: [{ id, title, kind: 'video' | 'reading' | 'quiz' | 'project', minutes, done, locked: 'reason' }] }]} defaultOpenId onOpenLesson={(lesson) => ...} onToggleDone={(lesson, done) => ...} />. Progress, the ring, time left, the next lesson for Continue and the certificate unlock are worked out from the lessons. A locked lesson is disabled and says why.",
    whenToUse: ["A course landing and progress page in a learning product", "Onboarding academies and training programs"],
    whenNotToUse: ["A single lesson player", "A list of courses to browse (use a card grid)"],
    composesWith: ["app-shell-1", "profile-1", "onboarding-1"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Each module heading is a button (expanded state announced); each lesson has its own done checkbox and an open button" },
      { keys: "Progress", action: "A labelled progress bar and 'N of M done' in text; the ring is decorative" },
      { keys: "Locked", action: "Disabled with the reason written beside the type, such as 'Quiz · Finish the project first'" },
    ],
    customization: ["Lesson kinds: video, reading, quiz, project, each with its icon and word", "Continue goes to the first lesson that is not done and not locked", "The ring and the module bars fill with a short transition that is off for reduced motion"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
