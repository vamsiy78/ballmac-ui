import { PodcastEpisode } from "@/components/ballmac/templates/podcast/podcast-episode"

export default function TemplatePodcastEpisode() {
  return (
    <PodcastEpisode
      hrefs={{ home: "/preview/template-podcast-demo", episodes: "/preview/template-podcast-episodes", episode: "/preview/template-podcast-episode", hosts: "/preview/template-podcast-hosts", subscribe: "/preview/template-podcast-subscribe" }}
    />
  )
}
