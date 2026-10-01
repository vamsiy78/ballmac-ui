import { PodcastSubscribe } from "@/components/ballmac/templates/podcast/podcast-subscribe"

export default function TemplatePodcastSubscribe() {
  return (
    <PodcastSubscribe
      hrefs={{ home: "/preview/template-podcast-demo", episodes: "/preview/template-podcast-episodes", episode: "/preview/template-podcast-episode", hosts: "/preview/template-podcast-hosts", subscribe: "/preview/template-podcast-subscribe" }}
    />
  )
}
