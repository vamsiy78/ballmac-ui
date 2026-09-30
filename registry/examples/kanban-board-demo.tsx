import { KanbanBoard } from "@/components/ballmac/kanban-board"
const columns = [
  {
    id: "planned",
    title: "Planned",
    cards: [
      {
        id: "a",
        title: "Review onboarding",
        description: "Check the first-run flow",
        label: "Design",
      },
      { id: "b", title: "Update docs", label: "Content" },
    ],
  },
  {
    id: "progress",
    title: "In progress",
    cards: [
      {
        id: "c",
        title: "Build dashboard",
        description: "Activity and metrics",
        label: "Engineering",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "d", title: "Define tokens", label: "Design" }],
  },
]
export default function KanbanBoardDemo() {
  return (
    <KanbanBoard
      className="w-full max-w-2xl"
      defaultColumns={columns}
      label="Product work board"
    />
  )
}
