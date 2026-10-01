import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "audio-player",
  type: "registry:ui",
  title: "Audio Player",
  description: "A podcast-style audio player: play and pause, skip back and forward, a scrubber with chapter ticks, a named current chapter and a speed control. Works with a real file or as a silent demo.",
  category: "data-display",
  tags: ["audio", "player", "podcast", "music", "media", "chapters", "speed"],
  files: [{ path: "components/audio-player.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "slider"],
  examples: [
    { name: "audio-player-demo", title: "Episode with chapters", file: "audio-player-demo.tsx" },
    { name: "audio-player-compact", title: "Compact mini player", file: "audio-player-compact.tsx" },
  ],
  ai: {
    summary: "Pass src (omit it for a silent demo), title, duration and optional chapters=[{ start, title }]. Control the position with time and onTimeChange to sync a transcript. variant='compact' is a one-row mini player.",
    whenToUse: ["Podcast episodes, audio articles, voice notes and music previews", "Syncing a transcript or chapter list to playback"],
    whenNotToUse: ["Video (use the native video element or video-dialog)"],
    composesWith: ["slider", "segmented-control", "scroll-area"],
    a11y: [
      { keys: "Space / Enter on Play", action: "Plays or pauses; the name switches between Play and Pause" },
      { keys: "Arrow keys on the scrubber", action: "Seeks one second; Page Up / Down seeks more; the value reads as 'm:ss of m:ss'" },
      { keys: "Skip buttons", action: "Jump back or forward by the configured seconds" },
    ],
    customization: ["rates: the speeds the speed button cycles through", "skip: { back, forward } seconds", "artwork: any node", "variant: default or compact"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
