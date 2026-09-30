import { CalendarAgenda } from "@/components/ballmac/calendar-agenda"
const events = [
  {
    id: "a",
    date: "2026-09-30",
    time: "09:30",
    title: "Team check-in",
    description: "Review priorities for the week",
  },
  {
    id: "b",
    date: "2026-09-30",
    time: "13:00",
    title: "Design review",
    description: "Dashboard and mobile flows",
    label: "Product",
  },
  {
    id: "c",
    date: "2026-09-30",
    time: "16:15",
    title: "Release planning",
    label: "Milestone",
  },
  { id: "d", date: "2026-10-01", time: "11:00", title: "Customer call" },
]
export default function CalendarAgendaDemo() {
  return (
    <CalendarAgenda
      className="w-full max-w-sm"
      events={events}
      defaultValue="2026-09-30"
    />
  )
}
