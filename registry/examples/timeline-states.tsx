import {
  Timeline,
  TimelineItem,
  TimelineMarker,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
  TimelineConnector,
} from "@/components/ballmac/timeline"
export default function TimelineStates() {
  return (
    <Timeline compact className="w-full max-w-xs">
      <TimelineItem complete>
        <TimelineMarker>✓</TimelineMarker>
        <TimelineConnector />
        <TimelineContent>
          <TimelineTitle>Build passed</TimelineTitle>
          <TimelineTime>11:42</TimelineTime>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem current>
        <TimelineMarker>2</TimelineMarker>
        <TimelineContent>
          <TimelineTitle>Deploying preview</TimelineTitle>
          <TimelineTime>11:45</TimelineTime>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  )
}
