import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-podcast",
  type: "registry:block",
  title: "The Long Table: podcast",
  description:
    "A warm five-page podcast site built on a new audio player: a home with a latest-episode hero and a mini player, an episodes archive, an episode page with chapters and a transcript that follows playback, hosts and subscribe.",
  category: "templates",
  templateKind: "content",
  templatePages: [
    { title: "Home", example: "template-podcast-demo", path: "/podcast" },
    { title: "Episodes", example: "template-podcast-episodes", path: "/podcast/episodes" },
    { title: "Episode", example: "template-podcast-episode", path: "/podcast/episodes/the-optimised-life" },
    { title: "Hosts", example: "template-podcast-hosts", path: "/podcast/hosts" },
    { title: "Subscribe", example: "template-podcast-subscribe", path: "/podcast/subscribe" },
  ],
  fonts: ["Young Serif", "Nunito Sans"],
  featured: true,
  tags: ["template", "podcast", "audio", "episodes", "transcript", "player", "show notes"],
  files: [
    { path: "components/templates/podcast/podcast-fonts.ts" },
    { path: "components/templates/podcast/podcast-data.ts" },
    { path: "components/templates/podcast/podcast-theme.tsx" },
    { path: "components/templates/podcast/podcast-home.tsx" },
    { path: "components/templates/podcast/podcast-episodes.tsx" },
    { path: "components/templates/podcast/podcast-episode.tsx" },
    { path: "components/templates/podcast/podcast-hosts.tsx" },
    { path: "components/templates/podcast/podcast-subscribe.tsx" },
    { path: "app/podcast/page.tsx" },
    { path: "app/podcast/episodes/page.tsx" },
    { path: "app/podcast/episodes/[slug]/page.tsx" },
    { path: "app/podcast/hosts/page.tsx" },
    { path: "app/podcast/subscribe/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "audio-player", "copy-button"],
  examples: [
    { name: "template-podcast-demo", title: "Home", file: "template-podcast-demo.tsx" },
    { name: "template-podcast-episodes", title: "Episodes", file: "template-podcast-episodes.tsx" },
    { name: "template-podcast-episode", title: "Episode", file: "template-podcast-episode.tsx" },
    { name: "template-podcast-hosts", title: "Hosts", file: "template-podcast-hosts.tsx" },
    { name: "template-podcast-subscribe", title: "Subscribe", file: "template-podcast-subscribe.tsx" },
  ],
  docs: "Pages are at /podcast, /podcast/episodes, /podcast/episodes/[slug], /podcast/hosts and /podcast/subscribe. Episodes and the transcript live in podcast-data.ts; pass a real src to AudioPlayer in podcast-episode.tsx to play audio (without one it runs a silent demo).",
  ai: {
    summary:
      "Installs a five-page podcast site on the audio-player component. Change episodes in podcast-data.ts, add src URLs for real audio, and edit podcastCss for the palette.",
    whenToUse: ["Podcasts, audio shows and interview series", "Any site where a transcript should follow audio playback"],
    whenNotToUse: ["Music streaming with playlists and queues"],
    composesWith: ["audio-player", "slider", "scroll-progress"],
    a11y: [
      { keys: "Click or Enter on a transcript line", action: "Seeks the player to that line" },
      { keys: "Enter / Space on a chapter", action: "Jumps to the start of the chapter" }
    ],
    customization: ["Add src to AudioPlayer in podcast-episode.tsx and podcast-theme.tsx", "Edit podcastCss for the light and dark palettes", "Replace ShowArt with cover images"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
