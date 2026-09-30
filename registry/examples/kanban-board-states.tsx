import { KanbanBoard } from "@/components/ballmac/kanban-board"
export default function KanbanBoardStates() {
  return (
    <KanbanBoard
      className="w-full max-w-md"
      defaultColumns={[
        {
          id: "todo",
          title: "To do",
          cards: [{ id: "task", title: "Prepare release" }],
        },
        { id: "done", title: "Done", cards: [] },
      ]}
      label="Release board"
    />
  )
}
