import {
  Timeline,
  TimelineItem,
  TimelineMarker,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  TimelineConnector,
} from "@/components/ballmac/timeline"
export default function TimelineDemo() {
  return (
    <Timeline className="w-full max-w-sm">
      <TimelineItem complete>
        <TimelineMarker>✓</TimelineMarker>
        <TimelineConnector />
        <TimelineContent>
          <TimelineTitle>Brief approved</TimelineTitle>
          <TimelineDescription>
            Scope and success criteria confirmed.
          </TimelineDescription>
          <TimelineTime dateTime="2026-09-25">Sep 25</TimelineTime>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem current>
        <TimelineMarker>2</TimelineMarker>
        <TimelineConnector />
        <TimelineContent>
          <TimelineTitle>Design review</TimelineTitle>
          <TimelineDescription>
            Components are ready for feedback.
          </TimelineDescription>
          <TimelineTime dateTime="2026-09-30">Today</TimelineTime>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineMarker>3</TimelineMarker>
        <TimelineContent>
          <TimelineTitle>Publish</TimelineTitle>
          <TimelineDescription>
            Ship the approved experience.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  )
}
