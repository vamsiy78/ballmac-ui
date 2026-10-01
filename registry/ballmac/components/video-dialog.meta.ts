import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "video-dialog",
  type: "registry:ui",
  title: "Video Dialog",
  description:
    "A thumbnail with a play button that opens a video in a focus-trapped dialog, for a video file, an embed URL or a YouTube id from the privacy-friendly domain, mounting the player only while open.",
  category: "marketing",
  tags: ["video", "dialog", "modal", "youtube", "thumbnail"],
  files: [{ path: "components/video-dialog.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "dialog"],
  examples: [
    { name: "video-dialog-demo", title: "Hero video", file: "video-dialog-demo.tsx" },
    { name: "video-dialog-aspects", title: "Shapes", file: "video-dialog-aspects.tsx" },
  ],
  ai: {
    summary:
      "<VideoDialog title thumbnail duration youtubeId | embedUrl | src aspect />. The player is created on open and removed on close, so nothing loads or keeps playing until asked.",
    whenToUse: ["Product demos and launch videos on landing pages", "Tutorial thumbnails"],
    whenNotToUse: ["Inline background video", "Audio only (use an audio player)"],
    composesWith: ["dialog", "card"],
    a11y: [
      { keys: "Enter / Space", action: "Opens the video" },
      { keys: "Escape", action: "Closes it and returns focus to the thumbnail" },
      { keys: "Screen readers", action: "Button reads 'Play video: Title'; the dialog is named by the title" },
    ],
    customization: ["youtubeId, embedUrl or src", "thumbnail", "duration", "aspect", "open / onOpenChange"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
