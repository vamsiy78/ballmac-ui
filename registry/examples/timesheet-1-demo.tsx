"use client"

import { Timesheet1 } from "@/components/ballmac/blocks/timesheet-1/timesheet-1"

export default function Timesheet1Demo() {
  return <Timesheet1 onSubmit={() => new Promise((r) => setTimeout(r, 700))} />
}
