import { CalendarAgenda } from "@/components/ballmac/calendar-agenda"
export default function CalendarAgendaStates() {
  return (
    <CalendarAgenda
      className="w-full max-w-sm"
      events={[]}
      defaultValue="2026-10-02"
      emptyMessage="A clear day to focus on deep work."
    />
  )
}
