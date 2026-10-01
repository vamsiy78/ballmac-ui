import { PodcastEpisodes } from "@/components/ballmac/templates/podcast/podcast-episodes"

export default function TemplatePodcastEpisodes() {
  return (
    <PodcastEpisodes
      hrefs={{ home: "/preview/template-podcast-demo", episodes: "/preview/template-podcast-episodes", episode: "/preview/template-podcast-episode", hosts: "/preview/template-podcast-hosts", subscribe: "/preview/template-podcast-subscribe" }}
    />
  )
}
