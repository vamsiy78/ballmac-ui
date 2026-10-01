import { LaunchChangelog } from "@/components/ballmac/templates/launch/launch-changelog"

export default function TemplateLaunchChangelog() {
  return (
    <LaunchChangelog
      hrefs={{ home: "/preview/template-launch-demo", pricing: "/preview/template-launch-pricing", changelog: "/preview/template-launch-changelog", contact: "/preview/template-launch-contact" }}
    />
  )
}
