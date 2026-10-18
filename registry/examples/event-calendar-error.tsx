import * as React from "react"

import { EventCalendar, type CalendarEvent } from "@/components/ballmac/event-calendar"


const TODAY = new Date(2026, 9, 21, 10, 42)

export default function EventCalendarError() {
  return (
    <EventCalendar
      label="Team calendar"
      events={[]}
      defaultView="month"
      defaultDate={TODAY}
      today={TODAY}
      locale="en-US"
      weekStartsOn={1}
      className="w-full max-w-4xl"
      state="error"
      onRetry={() => undefined}
    />
  )
}
