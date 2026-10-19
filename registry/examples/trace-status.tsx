import { CircleAlert, CircleDashed, Loader, Terminal } from "lucide-react"

import { Trace, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

export default function TraceStatus() {
  return (
    <Trace className="w-full max-w-md">
      <TraceLine>
        <TraceIcon>
          <Terminal />
        </TraceIcon>
        <TraceTitle>Ran pnpm install</TraceTitle>
        <TraceDescription>2.4s</TraceDescription>
      </TraceLine>
      <TraceLine status="running">
        <TraceIcon>
          <Loader className="animate-spin motion-reduce:animate-none" />
        </TraceIcon>
        <TraceTitle>Running pnpm build</TraceTitle>
      </TraceLine>
      <TraceLine status="error">
        <TraceIcon>
          <CircleAlert />
        </TraceIcon>
        <TraceTitle>Failed to run pnpm lint</TraceTitle>
        <TraceDescription>exit 1</TraceDescription>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon>
          <CircleDashed />
        </TraceIcon>
        <TraceTitle>Run pnpm test</TraceTitle>
      </TraceLine>
    </Trace>
  )
}
