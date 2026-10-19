"use client"

import * as React from "react"

import { EventCalendar, type CalendarEvent } from "@/components/ballmac/event-calendar"

const initial: CalendarEvent[] = [
  { id: "e1", title: "Sprint planning", start: "2026-10-19T09:30", end: "2026-10-19T10:30", tone: "chart-1", location: "Room 4" },
  { id: "e2", title: "Design review", start: "2026-10-20T11:00", end: "2026-10-20T12:00", tone: "chart-3" },
  { id: "e3", title: "Customer call: Northwind", start: "2026-10-20T11:30", end: "2026-10-20T12:30", tone: "chart-2", location: "Video" },
  { id: "e4", title: "Lunch with Priya", start: "2026-10-20T12:30", end: "2026-10-20T13:30", tone: "muted" },
  { id: "e5", title: "Launch week", start: "2026-10-21", end: "2026-10-23", allDay: true, tone: "chart-4" },
  { id: "e6", title: "1:1 with Omar", start: "2026-10-21T15:00", end: "2026-10-21T15:45", tone: "chart-1" },
  { id: "e7", title: "Quarterly review", start: "2026-10-22T10:00", end: "2026-10-22T12:30", tone: "chart-5", location: "Main hall" },
  { id: "e8", title: "Dentist", start: "2026-10-22T16:30", end: "2026-10-22T17:15", tone: "muted" },
  { id: "e9", title: "Ship 2.4", start: "2026-10-23T14:00", end: "2026-10-23T15:00", tone: "chart-2" },
  { id: "e10", title: "Team offsite", start: "2026-10-27", end: "2026-10-29", allDay: true, tone: "chart-3" },
  { id: "e11", title: "Board prep", start: "2026-10-26T13:00", end: "2026-10-26T15:00", tone: "chart-5" },
  { id: "e12", title: "Public holiday", start: "2026-10-30", allDay: true, tone: "muted" },
  { id: "e13", title: "Standup", start: "2026-10-19T09:00", end: "2026-10-19T09:15", tone: "chart-2" },
  { id: "e14", title: "Standup", start: "2026-10-20T09:00", end: "2026-10-20T09:15", tone: "chart-2" },
  { id: "e15", title: "Standup", start: "2026-10-21T09:00", end: "2026-10-21T09:15", tone: "chart-2" },
]

const TODAY = new Date(2026, 9, 21, 10, 42)

export default function EventCalendarDemo() {
  return (
    <EventCalendar
      label="Team calendar"
      events={initial}
      defaultView="month"
      defaultDate={TODAY}
      today={TODAY}
      locale="en-US"
      weekStartsOn={1}
      className="w-full max-w-4xl"
    />
  )
}
