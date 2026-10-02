import { ChevronLeft, Mic, Plus, Video } from "lucide-react"

import { PhoneFrame } from "@/components/ballmac/phone-frame"

const messages = [
  { from: "them", text: "Morning! How did the review go?" },
  { from: "me", text: "Approved. Two nits, both fixed." },
  { from: "them", text: "Is the new build on TestFlight yet?" },
  { from: "me", text: "Uploading now. Crash fix for the share sheet is in." },
  { from: "them", text: "Nice. I'll run it on the old iPad too." },
  { from: "me", text: "Build 214 is live 🎉" },
]

function Chat() {
  return (
    <div className="flex h-full flex-col text-[15px]">
      <div className="flex items-center gap-2 border-b px-3 pb-3">
        <ChevronLeft className="size-6 text-chart-1 rtl:rotate-180" aria-hidden="true" />
        <span className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--chart-2),var(--chart-1))] text-[13px] font-semibold text-white">
          RL
        </span>
        <span className="flex-1">
          <span className="block text-[14px] font-semibold">Release team</span>
          <span className="block text-[11px] text-muted-foreground">3 members</span>
        </span>
        <Video className="size-5 text-chart-1" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 px-3 py-4">
        <p className="mb-2 text-center text-[11px] text-muted-foreground">Today 9:38</p>
        {messages.map((m, i) => (
          <p
            key={i}
            className={
              m.from === "me"
                ? "max-w-[78%] self-end rounded-[20px] rounded-ee-md bg-chart-1 px-3.5 py-2 text-white"
                : "max-w-[78%] self-start rounded-[20px] rounded-es-md bg-muted px-3.5 py-2"
            }
          >
            {m.text}
          </p>
        ))}
        <p className="self-end text-[11px] text-muted-foreground">Delivered</p>
      </div>
      <div className="flex items-center gap-2 px-3 pb-9">
        <span className="flex size-8 items-center justify-center rounded-full bg-muted">
          <Plus className="size-4" aria-hidden="true" />
        </span>
        <span className="flex h-9 flex-1 items-center justify-between rounded-full border px-3.5 text-muted-foreground">
          Message
          <Mic className="size-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

export default function PhoneFrameChat() {
  return (
    <div className="flex w-full justify-center py-4">
      <PhoneFrame variant="black" screenWidth={390} screenClassName="dark" className="w-[248px]">
        <Chat />
      </PhoneFrame>
    </div>
  )
}
