import { Calendar1 } from "@/components/ballmac/blocks/calendar-1/calendar-1"

export default function Calendar1Compact() {
  return (
    <Calendar1
      height="34rem"
      today="2026-10-06"
      now={null}
      startHour={9}
      endHour={17}
      calendars={[{ id: "clinic", label: "Clinic", color: 2 }, { id: "admin", label: "Admin", color: 4 }]}
      defaultEvents={[
        { id: "a", title: "Dr. Costa", start: "2026-10-06T09:00", end: "2026-10-06T09:45", calendar: "clinic", location: "Room 2" },
        { id: "b", title: "Dr. Lima", start: "2026-10-06T09:30", end: "2026-10-06T10:30", calendar: "clinic", location: "Room 4" },
        { id: "c", title: "Supply order", start: "2026-10-07T11:00", end: "2026-10-07T11:30", calendar: "admin" },
        { id: "d", title: "Team lunch", start: "2026-10-08T12:00", end: "2026-10-08T13:00", calendar: "admin", location: "Terrace" },
      ]}
    />
  )
}
