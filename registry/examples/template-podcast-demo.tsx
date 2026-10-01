import { PodcastHome } from "@/components/ballmac/templates/podcast/podcast-home"

export default function TemplatePodcastDemo() {
  return (
    <PodcastHome
      hrefs={{ home: "/preview/template-podcast-demo", episodes: "/preview/template-podcast-episodes", episode: "/preview/template-podcast-episode", hosts: "/preview/template-podcast-hosts", subscribe: "/preview/template-podcast-subscribe" }}
    />
  )
}
