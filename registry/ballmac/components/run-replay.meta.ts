import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "run-replay",
  type: "registry:ui",
  title: "Run Replay",
  description:
    "Transport controls for replaying a recorded agent run: play and pause, a scrubber with marker dots, step to the previous or next marker, and 0.5 to 4 times speed. It owns the clock so one control can drive a trace, lanes or a log.",
  category: "ai",
  tags: ["ai", "agents", "replay", "scrubber", "playback", "timeline", "debug"],
  files: [{ path: "components/run-replay.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "run-replay-demo", title: "Replaying a run", file: "run-replay-demo.tsx" },
    { name: "run-replay-lanes", title: "Driving Agent Lanes", file: "run-replay-lanes.tsx" },
  ],
  ai: {
    summary:
      "duration in seconds; time / defaultTime / onTimeChange; playing / defaultPlaying / onPlayingChange; markers [{ time, label }]; speeds (0.5, 1, 2, 4). It only keeps the clock and renders controls; read `time` to show the run. Playback never starts by itself.",
    whenToUse: ["Debugging a finished agent run by watching it unfold", "Letting people scrub a recorded session next to its trace or logs"],
    whenNotToUse: ["Playing audio or video; use video-dialog or audio-player", "A live run; use trace or agent-lanes with now"],
    composesWith: ["agent-lanes", "trace", "log-stream", "run-ledger"],
    a11y: [
      { keys: "Tab", action: "Previous marker, Play or Pause, Next marker, the speeds, the scrubber, then each marker" },
      { keys: "Space / Enter", action: "Toggles play and pause" },
      { keys: "ArrowRight / ArrowLeft on the scrubber", action: "Moves one second (native range input); Home and End go to the ends" },
      { keys: "Screen readers", action: "The scrubber reads '1:12 of 4:30'; a polite note says which marker playback just reached" },
    ],
    customization: ["speeds", "formatTime", "markers", "Controlled time and playing"],
  },
  statesNone: "A control with no data of its own: it keeps a clock and reports it, so there is nothing to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
