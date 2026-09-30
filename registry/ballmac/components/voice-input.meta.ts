import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "voice-input",
  type: "registry:ui",
  title: "Voice Input",
  description:
    "A microphone control as a round button or an expanding recorder with a scrolling waveform, timer, discard and send, plus a hook that reads the real microphone level.",
  category: "ai",
  tags: ["ai", "voice", "microphone", "audio", "recorder", "input"],
  files: [{ path: "components/voice-input.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "voice-input-demo", title: "Recorder bar", file: "voice-input-demo.tsx" },
    { name: "voice-input-button", title: "Button with live glow", file: "voice-input-button.tsx" },
  ],
  ai: {
    summary:
      "The component draws the control; you record. onStart, onStop, onCancel fire; state (idle | listening | processing) can be controlled. Feed level (0 to 1) from useMicrophoneLevel(active) for a real waveform.",
    whenToUse: ["Dictation in a composer", "Voice messages"],
    whenNotToUse: ["Text entry; use prompt-input", "Playing audio; use audio-player"],
    composesWith: ["prompt-input", "ai-orb", "ai-chat"],
    a11y: [
      { keys: "Enter / Space", action: "Starts, and while listening stops and uses the recording" },
      { keys: "Escape", action: "Discards the recording while listening" },
      { keys: "Screen readers", action: "Button names change with state; status is announced politely; the waveform is decorative" },
    ],
    customization: ["variant: button | bar", "state", "level", "duration", "processingLabel", "useMicrophoneLevel"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
