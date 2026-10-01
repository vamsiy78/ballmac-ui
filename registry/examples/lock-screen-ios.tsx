"use client"

import * as React from "react"
import { Calendar, MessageCircle } from "lucide-react"

import { LockScreen } from "@/components/ballmac/lock-screen"
import { PhoneFrame } from "@/components/ballmac/phone-frame"

function Notification({ icon, app, title, body, when }: { icon: React.ReactNode; app: string; title: string; body: string; when: string }) {
  return (
    <div className="flex gap-3 rounded-[22px] bg-white/20 p-3.5 backdrop-blur-2xl">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/90 text-neutral-900 [&_svg]:size-5">{icon}</span>
      <div className="min-w-0 leading-tight">
        <p className="flex justify-between gap-2 text-[13px] text-white/85">
          <span className="font-medium">{app}</span>
          <span>{when}</span>
        </p>
        <p className="mt-0.5 truncate text-[15px] font-semibold">{title}</p>
        <p className="line-clamp-2 text-[14px] text-white/90">{body}</p>
      </div>
    </div>
  )
}

export default function LockScreenIos() {
  const [locked, setLocked] = React.useState(true)
  return (
    <div className="flex w-full flex-col items-center gap-4 py-4">
      <PhoneFrame screenWidth={390} statusBar={false} screenClassName="dark" className="max-w-[280px]">
        <div className="relative h-full bg-[linear-gradient(170deg,oklch(0.36_0.12_260),oklch(0.32_0.12_320))]">
          <p className="pt-24 text-center text-lg font-semibold text-white">Home Screen</p>
          <LockScreen variant="ios" locked={locked} onLockedChange={setLocked}>
            <Notification icon={<MessageCircle aria-hidden="true" />} app="Messages" title="Sam" body="Are we still on for dinner tonight? I booked the table by the window." when="now" />
            <Notification icon={<Calendar aria-hidden="true" />} app="Calendar" title="Design review" body="Starts in 15 minutes · Room 4B" when="9m ago" />
          </LockScreen>
        </div>
      </PhoneFrame>
      <button
        type="button"
        onClick={() => setLocked(true)}
        className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Lock again
      </button>
    </div>
  )
}
